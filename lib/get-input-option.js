const { resolve } = require('path')
const pluginJSON = require('rollup-plugin-json')
const pluginVue = require('rollup-plugin-vue').default
const pluginBabel = require('rollup-plugin-babel')
const pluginAlias = require('rollup-plugin-alias')
const pluginReplace = require('rollup-plugin-replace')
const uglifyJS = require('rollup-plugin-uglify')
const pluginCjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const requireContext = require('rollup-plugin-require-context')
const pluginMemory = require('./rollup-plugin-memory')
const pluginCSS = require('./rollup-plugin-postcss')
const objectAssign = Object.assign

const cssNoop = {
  transform (code, id) {
    if (/\.css$/.test(id)) {
      return 'export default {}'
    }
  }
}

const babelOption = {
  babelrc: false,
  exclude: 'node_modules/**',
  plugins: [
    require.resolve('babel-plugin-transform-vue-jsx'),
    [require.resolve('fast-async'), { spec: true }],
    [
      require.resolve('@babel/plugin-proposal-object-rest-spread'),
      {
        useBuiltIns: true,
        loose: true
      }
    ]
  ],
  presets: [
    [
      require('@babel/preset-env').default,
      {
        // Never polyfill something like `Promise` `Proxy`
        // Since we're building a library instead of an app
        // You should not include polyfill in your lib anyways
        useBuiltIns: false,
        modules: false,
        targets: { ie: 9 },
        exclude: ['transform-regenerator', 'transform-async-to-generator']
      }
    ]
  ]
}

module.exports = function bundle (data, { npmPrefix }) {
  const { input, uglify, cjs, replace, json, alias = {}, external = [] } = data
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

  const cssOption = data.postcss

  const inputOption = {
    input: entry,
    plugins: [
      memoryPlugin,
      cssOption
        ? pluginCSS({
          minimize: cssOption.minimize,
          output: cssOption.extract
        })
        : cssNoop,
      pluginVue({
        css: false,
        template: { optimizeSSR: false }
      }),
      pluginBabel(babelOption),
      pluginAlias(aliasOption),
      requireContext(),
      cjs === false ? {} : pluginCjs(cjs || {}),
      nodeResolve({
        jsnext: true,
        main: true,
        browser: true,
        extensions: ['.js', '.json', '.vue']
      }),
      replace === false ? {} : pluginReplace(envOption),
      json === false ? {} : pluginJSON(json || {}),
      uglify ? uglifyJS.uglify() : {}
    ],
    external
  }

  return inputOption
}
