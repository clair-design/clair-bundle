const common = {
  input: 'test/index.js',
  postcss: false,
  replace: {
    'process.env.TEST_ENV': '"test-env"'
  }
}

const options = [
  {
    ...common,
    uglify: false,
    output: [
      {
        format: 'umd',
        name: 'Emballer',
        file: 'test/dist/index.js',
        banner: '// banner...'
      }
    ]
  },
  {
    ...common,
    uglify: true,
    output: [
      {
        format: 'umd',
        name: 'Emballer',
        file: 'test/dist/index.min.js',
        banner: '// banner...'
      }
    ],
    postcss: {
      extract: 'test/dist/minimized.css',
      minimize: true
    }
  }
]

module.exports = { options }
