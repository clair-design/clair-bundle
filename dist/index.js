'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));
var rollupPluginVue = _interopDefault(require('rollup-plugin-vue'));
var rollupPluginJson = _interopDefault(require('rollup-plugin-json'));
var rollupPluginBuble = _interopDefault(require('rollup-plugin-buble'));
var rollupPluginAlias = _interopDefault(require('rollup-plugin-alias'));
var rollupPluginReplace = _interopDefault(require('rollup-plugin-replace'));
var rollupPluginPostcss = _interopDefault(require('rollup-plugin-postcss'));
var rollupPluginUglify = _interopDefault(require('rollup-plugin-uglify'));
var rollupPluginCommonjs = _interopDefault(require('rollup-plugin-commonjs'));
var rollupPluginNodeResolve = _interopDefault(require('rollup-plugin-node-resolve'));
var rollupPluginRequireContext = _interopDefault(require('rollup-plugin-require-context'));
var cssnano = _interopDefault(require('cssnano'));
var findNpmPrefix = _interopDefault(require('find-npm-prefix'));
var chokidar = _interopDefault(require('chokidar'));
var rollup = _interopDefault(require('rollup'));

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

/**
 * https://github.com/TrySound/rollup-plugin-memory/blob/master/src/index.js
 */
function isPath (path$$1) {
  return typeof path$$1 === 'string'
}

function isContents (contents) {
  return typeof contents === 'string' || Buffer.isBuffer(contents)
}

var rollupPluginMemory = function memory (config) {
  if ( config === void 0 ) config = {};

  var path$$1 = isPath(config.path) ? config.path : null;
  var contents = isContents(config.contents) ? String(config.contents) : null;

  return {
    // do not use `options` as name for 1st argument
    options: function options (rollupOptions) {
      var input = rollupOptions.input;
      if (input && typeof input === 'object') {
        if (isPath(input.path)) {
          path$$1 = input.path;
        }
        if (isContents(input.contents)) {
          contents = String(input.contents);
        }
      }
      rollupOptions.input = path$$1;
    },

    resolveId: function resolveId (id) {
      if (path$$1 === null || contents === null) {
        throw Error(
          "'path' should be a string and 'contents' should be a string of Buffer"
        )
      }
      if (id === path$$1) {
        return path$$1
      }
    },

    load: function load (id) {
      if (id === path$$1) {
        return contents
      }
    }
  }
};

var rollupPluginMemory$1 = /*#__PURE__*/Object.freeze({
	default: rollupPluginMemory,
	__moduleExports: rollupPluginMemory
});

var pluginMemory = ( rollupPluginMemory$1 && rollupPluginMemory ) || rollupPluginMemory$1;

var resolve = path.resolve;

/**
 * for Vue single file components
 */


/**
 * for json imports
 */


/**
 * buble ES2015 compiler
 * SEE https://buble.surge.sh/guide/
 */


/**
 * define aliases when bundling
 * SEE https://github.com/rollup/rollup-plugin-alias
 */


/**
 * replace content while bundling
 * SEE https://github.com/rollup/rollup-plugin-replace
 */


/**
 * PostCSS
 * SEE https://github.com/egoist/rollup-plugin-postcss
 */


/**
 * uglify
 * SEE https://github.com/TrySound/rollup-plugin-uglify
 */


/**
 * convert CommonJS modules to ES6
 * SEE https://github.com/rollup/rollup-plugin-commonjs
 */


/**
 * use the Node.js resolution algorithm with Rollup
 * SEE https://github.com/rollup/rollup-plugin-node-resolve
 */




/**
 * SEE https://github.com/TrySound/rollup-plugin-memory
 */


/**
 * use this plugin to ignore CSS
 */
var cssNoop = {
  transform: function transform (code, id) {
    if (/\.css$/.test(id)) {
      return 'export default {}'
    }
  }
};

var objectAssign = Object.assign;

var getInputOption = function bundle (data, ref) {
  var npmPrefix = ref.npmPrefix;

  var input = data.input;
  var uglify = data.uglify;
  var alias = data.alias; if ( alias === void 0 ) alias = {};
  var external = data.external; if ( external === void 0 ) external = [];
  var disableCjs = data.disableCjs; if ( disableCjs === void 0 ) disableCjs = false;
  var disableReplace = data.disableReplace; if ( disableReplace === void 0 ) disableReplace = false;

  var requireFromWorkingDir = function (id) {
    return commonjsRequire(resolve(npmPrefix, 'node_modules', id))
  };

  var postcssPlugin = cssNoop;

  // unless explicitly set to `false`
  // PosstCSS would be used
  if (data.postcss !== false) {
    var postcss = data.postcss || {};
    var extract = postcss.extract;
    var minify = postcss.minify;
    var sourcemap = postcss.sourcemap;
    postcss.plugins = postcss.plugins || [];

    var plugins = postcss.plugins.reduce(function (acc, plugin) {
      if (plugin && typeof plugin === 'object') {
        for (var name in plugin) {
          var option = plugin[name];
          acc.push(requireFromWorkingDir(name)(option));
        }
      } else if (typeof plugin === 'string') {
        acc.push(requireFromWorkingDir(plugin)());
      }
      return acc
    }, []);

    if (plugins.lenegth && minify) {
      plugins.push(cssnano());
    }

    postcssPlugin = rollupPluginPostcss({
      plugins: plugins,
      sourceMap: postcss.sourceMap || sourcemap,
      extract: typeof extract === 'string'
        ? resolve(npmPrefix, extract)
        : Boolean(extract)
    });
  }

  var nodeEnv = JSON.stringify(process.env.NODE_ENV);
  var vueAlias = resolve(npmPrefix, 'node_modules/vue/dist/vue.esm.js');

  for (var key in alias) {
    alias[key] = resolve(npmPrefix, alias[key]);
  }

  var entry = null;
  var memoryPlugin = {};

  if (typeof input === 'object') {
    entry = input;
    memoryPlugin = pluginMemory();
  } else {
    entry = resolve(npmPrefix, input);
  }

  var inputOption = {
    input: entry,
    plugins: [
      memoryPlugin,
      rollupPluginAlias(
        objectAssign(
          {
            resolve: ['.vue', '.js', '.css'],
            vue: vueAlias
          },
          alias
        )
      ),
      rollupPluginRequireContext(),
      rollupPluginNodeResolve({
        jsnext: true,
        main: true,
        browser: true,
        extensions: ['.js', '.json']
      }),
      disableCjs ? {} : rollupPluginCommonjs({}),
      disableReplace ? {} : rollupPluginReplace({ 'process.env.NODE_ENV': nodeEnv }),
      postcssPlugin,
      rollupPluginVue({ css: false }),
      rollupPluginJson(),
      rollupPluginBuble({ objectAssign: 'Object.assign' }),
      uglify ? rollupPluginUglify() : {}
    ],
    external: external
  };

  return inputOption
};

var getInputOption$1 = /*#__PURE__*/Object.freeze({
	default: getInputOption,
	__moduleExports: getInputOption
});

/**
 * get current working root directory
 * SEE https://github.com/npm/find-npm-prefix
 */

var npmPrefix = process.env.NPM_PREFIX;

function ensureNpmPrefix () {
  if (npmPrefix) {
    return Promise.resolve(npmPrefix)
  }

  return findNpmPrefix(process.cwd()).then(function (prefix) {
    npmPrefix = prefix;
    return prefix
  })
}

var ensureNpmPrefix_1 = ensureNpmPrefix;

var ensureNpmPrefix$1 = /*#__PURE__*/Object.freeze({
	default: ensureNpmPrefix_1,
	__moduleExports: ensureNpmPrefix_1
});

var getInputOption$2 = ( getInputOption$1 && getInputOption ) || getInputOption$1;

var ensureNpmPrefix$2 = ( ensureNpmPrefix$1 && ensureNpmPrefix_1 ) || ensureNpmPrefix$1;

var resolve$1 = path.resolve;

var rollup$1 = rollup.rollup;
var watch = rollup.watch;


var objectAssign$1 = Object.assign;

var lib = function (config, isWatch) {
  var fn = isWatch ? watchCompile : bundle;
  var options = config.options.filter(
    function (ref) {
      var input = ref.input;
      var output = ref.output;

      return !!input && !!output;
  }
  );

  return ensureNpmPrefix$2().then(function (npmPrefix) { return Promise.all(options.map(function (option) { return fn(option, { npmPrefix: npmPrefix }); })); }
  )
};

function bundle (config, ref) {
  var npmPrefix = ref.npmPrefix;

  var output = config.output;
  var inputOption = getInputOption$2(config, { npmPrefix: npmPrefix });
  var outputOption = fixOutputOption(output, { npmPrefix: npmPrefix });

  return rollup$1(inputOption).then(function (bundle) { return Promise.all(
      outputOption.map(function (option) { return bundle[option.file ? 'write' : 'generate'](option); }
      )
    ); }
  )
}

function watchCompile (config, ref) {
  var npmPrefix = ref.npmPrefix;

  var output = config.output;
  var inputOption = getInputOption$2(config, { npmPrefix: npmPrefix });
  var outputOption = fixOutputOption(output, { npmPrefix: npmPrefix });
  var watchOption = objectAssign$1(
    {
      watch: {
        chokidar: chokidar,
        exclude: ['node_modules/**']
      },
      output: outputOption
    },
    inputOption
  );

  return Promise.resolve(watch(watchOption))
}

function fixOutputOption (output, ref) {
  var npmPrefix = ref.npmPrefix;

  return [].concat(output).filter(Boolean).map(function (option) {
    if (option.file) {
      option.file = resolve$1(npmPrefix, option.file);
    }
    return option
  })
}

module.exports = lib;