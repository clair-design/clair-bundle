const { resolve } = require('path')

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
const commonJS = require('rollup-plugin-commonjs')

/**
 * use the Node.js resolution algorithm with Rollup
 * SEE https://github.com/rollup/rollup-plugin-node-resolve
 */
const nodeResolve = require('rollup-plugin-node-resolve')

const requireContext = require('rollup-plugin-require-context')

/**
 * SEE https://github.com/TrySound/rollup-plugin-memory
 */
const pluginMemory = require('./rollup-plugin-memory')

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
    alias = {},
    external = [],
    // internal
    disableCjs = false,
    disableReplace = false
  } = data

  const requireFromWorkingDir = function (id) {
    return require(resolve(npmPrefix, 'node_modules', id))
  }

  let postcssPlugin = cssNoop

  // unless explicitly set to `false`
  // PosstCSS would be used
  if (data.postcss !== false) {
    const postcss = data.postcss || {}
    const { extract, minify, sourcemap } = postcss
    postcss.plugins = postcss.plugins || []

    const plugins = postcss.plugins.reduce((acc, plugin) => {
      if (plugin && typeof plugin === 'object') {
        for (let name in plugin) {
          const option = plugin[name]
          acc.push(requireFromWorkingDir(name)(option))
        }
      } else if (typeof plugin === 'string') {
        acc.push(requireFromWorkingDir(plugin)())
      }
      return acc
    }, [])

    if (plugins.lenegth && minify) {
      plugins.push(require('cssnano')())
    }

    postcssPlugin = postCSS({
      plugins,
      sourceMap: postcss.sourceMap || sourcemap,
      extract: typeof extract === 'string'
        ? resolve(npmPrefix, extract)
        : Boolean(extract)
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
      requireContext(),
      nodeResolve({
        jsnext: true,
        main: true,
        browser: true,
        extensions: ['.js', '.json']
      }),
      disableCjs ? {} : commonJS({}),
      disableReplace ? {} : replace({ 'process.env.NODE_ENV': nodeEnv }),
      postcssPlugin,
      vue({ css: false }),
      json(),
      buble({ objectAssign: 'Object.assign' }),
      uglify ? uglifyJS() : {}
    ],
    external
  }

  return inputOption
}
