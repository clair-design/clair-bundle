/**
 * get current working root directory
 * SEE https://github.com/npm/find-npm-prefix
 */
const findNpmPrefix = require('find-npm-prefix')
let npmPrefix = process.env.NPM_PREFIX

function ensureNpmPrefix () {
  if (npmPrefix) {
    return Promise.resolve(npmPrefix)
  }

  return findNpmPrefix(process.cwd()).then(prefix => {
    npmPrefix = prefix
    return prefix
  })
}

module.exports = ensureNpmPrefix
