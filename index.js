var through = require('through2');
var PluginError = require('gulp-util').PluginError;

const PLUGIN_NAME = 'gulp-json-transform';

var jsonTransform = function (file, transformFn, jsonSpace) {
  var input = JSON.parse(file.contents.toString('utf8'));
  var output = transformFn(input);
  if (typeof output === 'string') {
    file.contents = new Buffer(output);
  } else {
    file.contents = new Buffer(JSON.stringify(output, null, jsonSpace));
  }
};

var gulpJsonTransform = function(transformFn, jsonSpace) {
  if (!transformFn) {
    throw new PluginError(PLUGIN_NAME, PLUGIN_NAME + ': Missing transform function!');
  }

  var stream = through.obj(function(file, enc, cb) {

    if (file.isStream()) {
        return this.emit('error', new PluginError(PLUGIN_NAME, PLUGIN_NAME + ': Streaming not supported'));
    }

    if (file.isBuffer()) {
        try {
          jsonTransform(file, transformFn, jsonSpace);
        } catch (e) {
          console.log(e);
          return this.emit('error', new PluginError(PLUGIN_NAME, PLUGIN_NAME + ': Unable to transform "' + file.path + '" maybe it\'s not a valid json file.'));
        }
    }

    this.push(file);

    return cb();
  });

  return stream;
};

module.exports = gulpJsonTransform