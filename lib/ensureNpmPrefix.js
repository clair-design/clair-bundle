/**
 * get current working root directory
 * SEE https://github.com/npm/find-npm-prefix
 */
import findNpmPrefix from 'find-npm-prefix'
let npmPrefix = null

function ensureNpmPrefix () {
  if (npmPrefix) {
    return Promise.resolve(npmPrefix)
  }

  return findNpmPrefix(process.cwd())
    .then(prefix => {
      npmPrefix = prefix
      return prefix
    })
}

export default ensureNpmPrefix
