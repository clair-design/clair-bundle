import { resolve } from 'path'

/**
 * for Vue single file components
 */
import vue from 'rollup-plugin-vue'

/**
 * for json imports
 */
import json from 'rollup-plugin-json'

/**
 * buble ES2015 compiler
 * SEE https://buble.surge.sh/guide/
 */
import buble from 'rollup-plugin-buble'

/**
 * define aliases when bundling
 * SEE https://github.com/rollup/rollup-plugin-alias
 */
import pluginAlias from 'rollup-plugin-alias'

/**
 * replace content while bundling
 * SEE https://github.com/rollup/rollup-plugin-replace
 */
import replace from 'rollup-plugin-replace'

/**
 * PostCSS
 * SEE https://github.com/egoist/rollup-plugin-postcss
 */
import postCSS from 'rollup-plugin-postcss'

/**
 * uglify
 * SEE https://github.com/TrySound/rollup-plugin-uglify
 */
import uglifyJS from 'rollup-plugin-uglify'

/**
 * convert CommonJS modules to ES6
 * SEE https://github.com/rollup/rollup-plugin-commonjs
 */
import commonJS from 'rollup-plugin-commonjs'

/**
 * use the Node.js resolution algorithm with Rollup
 * SEE https://github.com/rollup/rollup-plugin-node-resolve
 */
import nodeResolve from 'rollup-plugin-node-resolve'

import requireContext from 'rollup-plugin-require-context'

/**
 * SEE https://github.com/TrySound/rollup-plugin-memory
 */
import pluginMemory from './rollup-plugin-memory'

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

export default function bundle (data, { npmPrefix }) {
  const {
    input,
    uglify,
    postcss,
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

  if (postcss) {
    const { extract, minify, sourceMap } = postcss

    const plugins = postcss.plugins.reduce((acc, plugin) => {
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
      plugins.push(require('cssnano')())
    }

    postcssPlugin = postCSS({
      sourceMap,
      extract: resolve(npmPrefix, extract),
      plugins: plugins
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
