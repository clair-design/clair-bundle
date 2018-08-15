// NOTICE: avoid using `require` in your source code
const { dependencies } = require('./package.json')
const options = [
  {
    input: 'lib/index.js',
    output: [{ format: 'cjs', name: 'Emballer', file: 'dist/index.js' }],

    external (id) {
      return !!dependencies[id]
    },

    // rollup-plugin-alias option
    // default:
    // { vue: 'node_modules/vue/dist/vue.esm.js' }
    // absolute path value is appreciated
    alias: {},

    // rollup-plugin-commonjs option
    // if false, won't use the plugin
    cjs: {},

    // rollup-plugin-replace option
    // if false, won't use the plugin
    replace: false,

    // rollup-plugin-json option
    // if false, won't use the plugin
    json: {},

    postcss: {
      minimize: false,
      extract: true
    },

    uglify: false
  }
]

module.exports = { options }
