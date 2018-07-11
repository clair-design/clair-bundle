const options = [
  {
    input: 'lib/index.js',
    output: [{ format: 'cjs', name: 'Emballer', file: 'dist/index.js' }],

    external (id) {
      return /^[a-z][\w-]/i.test(id)
    },
    disableCjs: false,
    disableReplace: true,
    postcss: false
  }
]

module.exports = { options }
