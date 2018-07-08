const common = {
  external (id) {
    return /^[a-z][\w-]/i.test(id)
  },
  disableCjs: true,
  disableReplace: true
}

const decorate = obj => Object.assign(obj, common)
const options = [
  decorate({
    input: './lib/index.js',
    output: [{ format: 'cjs', name: 'ClairBundle', file: './dist/index.js' }]
  }),
  decorate({
    input: './lib/bin.js',
    output: [
      {
        format: 'cjs',
        file: './bin/index',
        banner: '#!/usr/bin/env node\n'
      }
    ]
  })
]

module.exports = { options }
