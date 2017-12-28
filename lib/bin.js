/**
 * SEE https://github.com/nodeca/js-yaml
 */
import jsYaml from 'js-yaml'

import execa from 'execa'
import { resolve } from 'x-path'
import { readFile } from 'fs-extra'

import ensureNpmPrefix from './ensureNpmPrefix'
import bundle from './'

const runS = cmds => cmds.reduce(
  (p, cmd) => p
    .then(ret => execa.shell(cmd))
    .then(result => console.log(result.stdout)),
  Promise.resolve()
)

ensureNpmPrefix()
  .then(prefix => resolve(prefix, 'bundle.yml'))
  .then(file => readFile(file, 'utf-8'))
  .then(content => jsYaml.load(content))
  .then(config => {
    let { before, after } = config.commands || {}
    after = [].concat(after).filter(Boolean)
    before = [].concat(before).filter(Boolean)

    return runS(before)
      .then(_ => bundle(config))
      .then(_ => runS(after))
  })
  .catch(e => console.log(e))
