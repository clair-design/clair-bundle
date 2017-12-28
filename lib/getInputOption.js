const { resolve } = require('x-path')

/**
 * for Vue single file components
 */
const vue = require('rollup-plugin-vue')

/**
 * for json imports
 */
const json = require('rollup-plugin-json')

/**
 * buble ES2015 compiler
 * SEE https://buble.surge.sh/guide/
 */
const buble = require('rollup-plugin-buble')

/**
 * define aliases when bundling
 * SEE https://github.com/rollup/rollup-plugin-alias
 */
const pluginAlias = require('rollup-plugin-alias')

/**
 * replace content while bundling
 * SEE https://github.com/rollup/rollup-plugin-replace
 */
const replace = require('rollup-plugin-replace')

/**
 * PostCSS
 * SEE https://github.com/egoist/rollup-plugin-postcss
 */
const postCSS = require('rollup-plugin-postcss')

/**
 * uglify
 * SEE https://github.com/TrySound/rollup-plugin-uglify
 */
const uglifyJS = require('rollup-plugin-uglify')

/**
 * convert CommonJS modules to ES6
 * SEE https://github.com/rollup/rollup-plugin-commonjs
 */
const commonjs = require('rollup-plugin-commonjs')

/**
 * use the Node.js resolution algorithm with Rollup
 * SEE https://github.com/rollup/rollup-plugin-node-resolve
 */
const nodeResolve = require('rollup-plugin-node-resolve')

/**
 * loading SVG as vue single file components
 * supporting glob imports
 * SEE https://github.com/AngusFu/rollup-plugin-svg-vue
 */
const svgVue = require('rollup-plugin-svg-vue')

/**
 * handle importee in glob pattern
 * SEE https://github.com/AngusFu/rollup-plugin-glob
 */
const globImport = require('rollup-plugin-glob')

/**
 * SEE https://github.com/TrySound/rollup-plugin-memory
 */
const pluginMemory = require('./pluginMemory')

/**
 * use this plugin to ignore CSS
 */
const cssNoop = {
  transform (code, id) {
    if (/\.css$/.test(id)) {
      return 'export default {}'
    }
  }
}

const objectAssign = Object.assign

module.exports = function bundle (data, { npmPrefix }) {
  const {
    input,
    uglify,
    postcss,
    alias = {},
    external = []
  } = data

  const requireFromWorkingDir = function (id) {
    return require(resolve(npmPrefix, 'node_modules', id))
  }

  let CSSPlugin = cssNoop

  if (postcss) {
    const { extract, minify, sourcemap, plugins } = postcss

    const postcssPlugins = plugins.reduce((acc, plugin) => {
      if (plugin && typeof plugin === 'object') {
        for (let name in plugin) {
          const option = plugin[name]
          acc.push(
            requireFromWorkingDir(name)(option)
          )
        }
      } else if (typeof plugin === 'string') {
        acc.push(
          requireFromWorkingDir(plugin)()
        )
      }
      return acc
    }, [])

    if (minify) {
      postcssPlugins.push(require('cssnano')())
    }

    CSSPlugin = postCSS({
      extract: resolve(npmPrefix, extract),
      plugins: postcssPlugins,
      sourceMap: sourcemap
    })
  }

  const nodeEnv = JSON.stringify(process.env.NODE_ENV)
  const vueAlias = resolve(npmPrefix, 'node_modules/vue/dist/vue.esm.js')

  for (let key in alias) {
    alias[key] = resolve(npmPrefix, alias[key])
  }

  let entry = null
  let memoryPlugin = {}

  if (typeof input === 'object') {
    entry = input
    memoryPlugin = pluginMemory()
  } else {
    entry = resolve(npmPrefix, input)
  }

  const inputOption = {
    input: entry,
    plugins: [
      memoryPlugin,
      pluginAlias(
        objectAssign(
          {
            resolve: ['.vue', '.js', '.css'],
            vue: vueAlias
          },
          alias
        )
      ),
      svgVue(),
      globImport({
        exclude: '*.svg'
      }),
      nodeResolve({
        jsnext: true,
        main: true,
        browser: true,
        extensions: ['.js', '.json']
      }),
      commonjs({}),
      replace({
        'process.env.NODE_ENV': nodeEnv
      }),
      CSSPlugin,
      vue(),
      json(),
      buble({
        exclude: 'node_modules/**',
        objectAssign: 'Object.assign'
      }),
      uglify ? uglifyJS() : {}
    ],
    external
  }

  return inputOption
}
