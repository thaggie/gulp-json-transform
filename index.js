var Promise = require('promise');
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-json-transform';

function parseJSON(rawStr) {
  return new Promise(function(resolve) {
    var rawText = rawStr.toString('utf8');
    var json = JSON.parse(rawText);
    resolve(json);
  });
}

module.exports = function(transformFn, jsonSpace) {
  if (!transformFn) {
    throw new PluginError(PLUGIN_NAME, 'Missing transform function!');
  }

  return through.obj(function(file, enc, cb) {
    var self = this;

    if (file.isStream()) {
      return self.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }

    if (file.isBuffer()) {

      parseJSON(file.contents.toString(enc))
        .catch(function(e) {
          throw new PluginError(PLUGIN_NAME, 'Invalid JSON');
        })
        .then(transformFn)
        .then(function toBuffer(output) {
          if (typeof output === 'string') {
            return new Buffer(output);
          } else {
            return new Buffer(JSON.stringify(output, null, jsonSpace));
          }
        })
        .then(function(buffer) {
          file.contents = buffer;
          self.push(file);
          cb();
        })
        .catch(function(e) {
          gutil.log(PLUGIN_NAME + ':', gutil.colors.red(e.message));
          self.emit('error', new PluginError(PLUGIN_NAME, e));
        });

    }

  });

};