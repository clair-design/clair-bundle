const options = [
  {
    input: 'lib/index.js',
    output: [{ format: 'cjs', name: 'Emballer', file: 'dist/index.js' }],

    external (id) {
      return /^[a-z][\w-]/i.test(id)
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
    replace: {
      // process.env option
      // remember to stringify values
      'process.env.NODE_ENV': JSON.stringify('production')
    },

    // rollup-plugin-json option
    // if false, won't use the plugin
    json: {},

    // buble option (would be merged with default value)
    buble: {},

    // if explicitly set to `false`, PosstCSS would NOT be used.
    // otherwise, `postcss.config.js` in your project would be used.
    // You can also just use an object (which is not as flexible)
    postcss: false

    // uglify: true
  }
]

module.exports = { options }
