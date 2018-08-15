// Based on: rollup-plugin-css-only
// https://github.com/thgh/rollup-plugin-css-only/blob/master/src/index.js

const path = require('path')
const { writeFile } = require('fs')
const mkdirp = require('mkdirp')
const postcss = require('postcss')
const findConfig = require('postcss-load-config')
const styleInjectPath = require
  .resolve('style-inject/dist/style-inject.es')
  .replace(/[\\/]+/g, '/')

module.exports = function css (config = {}) {
  const styles = {}
  let dest = config.output
  let changes = 0

  return {
    name: 'post-css',
    async transform (code, id) {
      if (/\.css/.test(id) === false) {
        return
      }

      const { plugins, options } = await findConfig()

      if (config.minimize) {
        plugins.push(require('cssnano')(config.minimize))
      }

      const { css } = await postcss(plugins).process(code, {
        ...options,
        from: id
      })

      // When output is disabled, the stylesheet is exported as a string
      if (config.output === false) {
        let output = `import styleInject from '${styleInjectPath}';
var css = ${JSON.stringify(css)};
styleInject(css);
export default css;`

        return {
          code: output,
          map: { mappings: '' }
        }
      }

      // Keep track of every stylesheet
      // Check if it changed since last render
      if (styles[id] !== css && (styles[id] || css)) {
        styles[id] = css
        changes++
      }

      return ''
    },
    ongenerate (opts) {
      // No stylesheet needed
      if (!changes || config.output === false) {
        return
      }
      changes = 0

      // Combine all stylesheets
      let css = ''
      for (const id in styles) {
        css += styles[id] || ''
      }

      // Emit styles through callback
      if (typeof config.output === 'function') {
        config.output(css, styles)
        return
      }

      if (typeof dest !== 'string') {
        // Don't create unwanted empty stylesheets
        if (!css.length) {
          return
        }

        // Guess destination filename
        dest =
          opts.file ||
          (Array.isArray(opts.output)
            ? opts.output[0].file
            : opts.output && opts.output.file) ||
          opts.dest ||
          'bundle.js'
        if (dest.endsWith('.js')) {
          dest = dest.slice(0, -3)
        }
        dest = dest + '.css'
      }

      // Emit styles to file
      return new Promise(function (resolve, reject) {
        let { dir } = path.parse(dest)

        mkdirp(dir, err => {
          if (err) {
            reject(err)
          } else {
            writeFile(dest, css, err => {
              if (err) {
                reject(err)
              } else {
                resolve()
              }
            })
          }
        })
      })
    }
  }
}
