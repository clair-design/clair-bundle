const { resolve } = require('path')

const pluginVue = require('rollup-plugin-vue')
const pluginJSON = require('rollup-plugin-json')

/**
 * buble ES2015 compiler
 * SEE https://buble.surge.sh/guide/
 */
const pluginBuble = require('rollup-plugin-buble')

/**
 * define aliases when bundling
 * SEE https://github.com/rollup/rollup-plugin-alias
 */
const pluginAlias = require('rollup-plugin-alias')

/**
 * replace content while bundling
 * SEE https://github.com/rollup/rollup-plugin-replace
 */
const pluginReplace = require('rollup-plugin-replace')

/**
 * PostCSS
 * SEE https://github.com/egoist/rollup-plugin-postcss
 */
const pluginPostCSS = require('rollup-plugin-postcss')

/**
 * uglify
 * SEE https://github.com/TrySound/rollup-plugin-uglify
 */
const uglifyJS = require('rollup-plugin-uglify')

/**
 * convert CommonJS modules to ES6
 * SEE https://github.com/rollup/rollup-plugin-commonjs
 */
const pluginCjs = require('rollup-plugin-commonjs')

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
    cjs,
    vue,
    buble,
    replace,
    json,
    alias = {},
    external = []
  } = data

  const requireFromWorkingDir = function (id) {
    return require(resolve(npmPrefix, 'node_modules', id))
  }

  let postCSSPlugin = cssNoop

  // unless explicitly set to `false`
  // PosstCSS would be used
  if (data.postcss !== false) {
    const { postcss = {} } = data
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

    if (plugins.length && minify) {
      plugins.push(require('cssnano')())
    }

    postCSSPlugin = pluginPostCSS({
      plugins,
      sourceMap: postcss.sourceMap || sourcemap,
      extract: typeof extract === 'string'
        ? resolve(npmPrefix, extract)
        : Boolean(extract)
    })
  }

  const aliasOption = objectAssign(
    {
      vue: resolve(npmPrefix, 'node_modules/vue/dist/vue.esm.js'),
      resolve: ['.vue', '.js', '.css']
    },
    Object.keys(alias).reduce((acc, key) => {
      acc[key] = resolve(npmPrefix, alias[key])
      return acc
    }, {})
  )

  const bubleOption = objectAssign(
    {
      objectAssign: 'Object.assign',
      jsx: 'h',
      transforms: {
        dangerousForOf: true
      }
    },
    buble
  )

  const envOption = objectAssign(
    {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    },
    replace
  )

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
      pluginAlias(aliasOption),
      requireContext(),
      nodeResolve({
        jsnext: true,
        main: true,
        browser: true,
        extensions: ['.js', '.json', '.jsx', '.vue']
      }),
      cjs === false ? {} : pluginCjs(cjs || {}),
      replace === false ? {} : pluginReplace(envOption),
      postCSSPlugin,
      pluginVue(objectAssign({ css: false }, vue)),
      json === false ? {} : pluginJSON(json || {}),
      pluginBuble(bubleOption),
      uglify ? uglifyJS.uglify() : {}
    ],
    external
  }

  return inputOption
}
