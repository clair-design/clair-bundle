import { resolve } from 'path'

import ensureNpmPrefix from './ensure-npm-prefix'
import bundle from './'

ensureNpmPrefix()
  .then(prefix => resolve(prefix, 'emballer.config.js'))
  .then(file => require(file))
  .then(config => bundle(config, config.isWatch))
  .catch(e => console.log(e))
