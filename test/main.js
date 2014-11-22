'use strict';

var jsonTransform = require('../');

var should = require('should');
require('mocha');

var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');

describe('gulp-json-transform', function () {

	var testTransform = function (inputFile, transformFn, expected) {
		var inputJson = new gutil.File({
			path: 'test/fixtures/' + inputFile,
			cwd: 'test/',
			base: 'test/fixtures',
			contents: fs.readFileSync('test/fixtures/' + inputFile)
		});

		return function (done) {
			var stream = jsonTransform(transformFn);

			stream.on('error', function(err) {
				should.exist(err);
				done(err);
			});

			stream.on('data', function (newFile) {
				should.exist(newFile);
				should.exist(newFile.contents);
				var newFilePath = path.resolve(newFile.path);
				var expectedFilePath = path.resolve('test/fixtures/' + inputFile);
				newFilePath.should.equal(expectedFilePath);
				newFile.relative.should.equal(inputFile);
				String(newFile.contents).should.equal(expected);
				Buffer.isBuffer(newFile.contents).should.equal(true);
				done();
			});

			stream.write(inputJson);
			stream.end();		
		};
	};

	it('should transform a json file to a json file', testTransform('input.json', function(data) {
			return {foobar: data.foo + data.bar};
		}, '{"foobar":"[foo][bar]"}'));

  	it('should transform a json file to a text file', testTransform('input.json', function(data) {
			return data.foo + data.bar;
		}, '[foo][bar]'));
});