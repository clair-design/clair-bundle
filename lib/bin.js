import execa from 'execa'
import { resolve } from 'path'

import ensureNpmPrefix from './ensure-npm-prefix'
import bundle from './'

const runS = cmds => cmds.reduce(
  (p, cmd) => p
    .then(ret => execa.shell(cmd))
    .then(result => console.log(result.stdout)),
  Promise.resolve()
)

ensureNpmPrefix()
  .then(prefix => resolve(prefix, 'emballer.config.js'))
  .then(file => require(file, 'utf-8'))
  .then(config => {
    let { before, after } = config.commands || {}
    after = [].concat(after).filter(Boolean)
    before = [].concat(before).filter(Boolean)

    return runS(before)
      .then(_ => bundle(config))
      .then(_ => runS(after))
  })
  .catch(e => console.log(e))
