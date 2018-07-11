const options = [
  {
    input: 'test/index.js',
    output: [{ format: 'umd', name: 'Emballer', file: 'test/dist/index.js' }],
    postcss: {
      extract: true
    }
  }
]

module.exports = { options }
