var Circus = require('circus'),
    CircusRouter = require('../../lib'),
    ModuleNotFoundError = require('webpack/lib/ModuleNotFoundError'),
    webpack = require('webpack');

var expect = require('chai').expect,
    temp = require('temp'),
    fs = require('fs'),
    path = require('path');

describe('loader plugin', function() {
  var outputDir;

  beforeEach(function(done) {
    temp.mkdir('loader-plugin', function(err, dirPath) {
      if (err) {
        throw err;
      }

      outputDir = dirPath;
      done();
    });
  });
  afterEach(function() {
    temp.cleanupSync();
  });

  it('should create a chunk for each import', function(done) {
    var entry = path.resolve(__dirname + '/../fixtures/loader.js');

    var config = {
      entry: entry,
      output: {
        component: 'pack',
        path: outputDir
      },

      externals: {
        'circus': 'Circus'
      }
    };
    config = CircusRouter.config(config);
    config = Circus.config(config);

    webpack(config, function(err, status) {
      expect(err).to.not.exist;
      expect(status.compilation.errors).to.be.empty;
      expect(status.compilation.warnings.length).to.equal(3);
      expect(status.compilation.warnings[2]).to.match(/loader.js:\d+ - Circus.loader used to load module "`.\/router-no-routes.js" declaring no route/);

      // Verify the chunk division
      expect(status.compilation.chunks.length).to.equal(5);

      // Verify the loader boilerplate
      var output = fs.readFileSync(outputDir + '/bundle.js').toString();
      expect(output).to.match(/Circus.loader\(__webpack_require__, \{"modules":\{"2":\{"chunk":1\},"3":\{"chunk":2\}\},"routes":\{"\/foo":3,"\/bar":3\}\}\);/);

      // Verify the module map output
      var pack = JSON.parse(fs.readFileSync(outputDir + '/circus.json').toString());
      delete pack.circusVersion;   // To avoid erroring the tests
      expect(pack).to.eql({
        "bootstrap": "bootstrap.js",
        "components": [],
        "chunks": [
          {"js": "bundle.js", "css": "0.bundle.css"},
          {"js": "1.bundle.js"},
          {"js": "2.bundle.js"},
          {"js": "3.bundle.js"}
        ],
        "modules": {
          "0": {
            "chunk": 0,
            "name": "pack/test/fixtures/loader"
          },
          "2": {
            "chunk": 1,
            "name": "pack/test/fixtures/router1"
          },
          "3": {
            "chunk": 2,
            "name": "pack/test/fixtures/router-imported"
          },
          "4": {
            "chunk": 3,
            "name": "pack/test/fixtures/router-no-routes"
          }
        },
        "routes": {
          "/foo": 3,
          "/bar": 3
        },
        "files": [
          "bundle.js",
          "0.bundle.css",
          "1.bundle.js",
          "2.bundle.js",
          "3.bundle.js",
        ],
        "published": {
          "bundle.js": "bundle.js",
          "1.bundle.js": "1.bundle.js",
          "2.bundle.js": "2.bundle.js",
          "3.bundle.js": "3.bundle.js",
          "0.bundle.css": "0.bundle.css"
        },
        "entry": "bundle.js",
        "usedModules": []
      });

      done();
    });
  });
  it('should warn on multiple imports', function(done) {
    var entry = path.resolve(__dirname + '/../fixtures/loader-multiple.js');

    var config = {
      entry: entry,
      output: {
        component: 'pack',
        path: outputDir
      },
      circusNamespace: 'Circus',

      externals: {
        'circus': 'Circus'
      }
    };
    config = CircusRouter.config(config);
    config = Circus.config(config);

    webpack(config, function(err, status) {
      expect(err).to.not.exist;
      expect(status.compilation.errors).to.be.empty;
      expect(status.compilation.warnings.length).to.equal(1);
      expect(status.compilation.warnings[0]).to.match(/loader-multiple.js:4 - Circus.loader used multiple times in one chunk/);

      // Verify the chunk division
      expect(status.compilation.chunks.length).to.equal(4);

      // Verify the loader boilerplate
      var output = fs.readFileSync(outputDir + '/bundle.js').toString();
      expect(output).to.match(/Circus.loader\(__webpack_require__, \{"modules":\{"1":\{"chunk":1\}\},"routes":\{"\/foo":1,"\/bar":1\}\}\);/);
      expect(output).to.match(/Circus.loader\(__webpack_require__, \{"modules":\{"2":\{"chunk":2\}\},"routes":\{"\/foo":2,"\/bar":2\}\}\);/);

      // Verify the module map output
      var pack = JSON.parse(fs.readFileSync(outputDir + '/circus.json').toString());
      delete pack.circusVersion;   // To avoid erroring the tests
      expect(pack).to.eql({
        "bootstrap": "bootstrap.js",
        "components": [],
        "chunks": [
          {"js": "bundle.js"},
          {"js": "1.bundle.js"},
          {"js": "2.bundle.js"}
        ],
        "modules": {
          "0": {
            "chunk": 0,
            "name": "pack/test/fixtures/loader-multiple"
          },
          "1": {
            "chunk": 1,
            "name": "pack/test/fixtures/router1"
          },
          "2": {
            "chunk": 2,
            "name": "pack/test/fixtures/router-imported"
          }
        },
        "routes": {
          "/foo": 2,
          "/bar": 2
        },
        "files": [
          "bundle.js",
          "1.bundle.js",
          "2.bundle.js",
        ],
        "published": {
          "bundle.js": "bundle.js",
          "1.bundle.js": "1.bundle.js",
          "2.bundle.js": "2.bundle.js",
        },
        "entry": "bundle.js",
        "usedModules": []
      });

      done();
    });
  });
  it('should warn for missing metadata', function(done) {
    var entry = path.resolve(__dirname + '/../fixtures/loader-no-imports.js');

    var config = {
      entry: entry,
      output: {path: outputDir},
    };
    config = CircusRouter.config(config);
    config = Circus.config(config);
    webpack(config, function(err, status) {
      expect(err).to.not.exist;
      expect(status.compilation.errors).to.be.empty;
      expect(status.compilation.warnings.length).to.equal(2);
      expect(status.compilation.warnings[0]).to.match(/loader-no-imports.js:1 - No imports/);
      expect(status.compilation.warnings[1]).to.match(/loader-no-imports.js:3 - No imports/);

      done();
    });
  });
  it('should NOP for no loader definition', function(done) {
    var entry = path.resolve(__dirname + '/../fixtures/eval-loader.js');

    var config = {
      entry: entry,
      output: {path: outputDir},
    };
    config = CircusRouter.config(config);
    config = Circus.config(config);

    webpack(config, function(err, status) {
      expect(err).to.not.exist;
      expect(status.compilation.errors).to.be.empty;
      expect(status.compilation.warnings).to.be.empty;

      done();
    });
  });
  it('should error for missing imports', function(done) {
    var entry = path.resolve(__dirname + '/../fixtures/loader-missing.js');

    var config = {
      entry: entry,
      output: {path: outputDir},
    };
    config = CircusRouter.config(config);
    config = Circus.config(config);

    webpack(config, function(err, status) {
      expect(err).to.not.exist;
      expect(status.compilation.errors[0]).to.be.instanceof(ModuleNotFoundError);
      expect(status.compilation.warnings).to.be.empty;

      done();
    });
  });

  it('should extract metadata with explicit import', function(done) {
    var entry = path.resolve(__dirname + '/../fixtures/loader-imported.js');

    var config = {
      entry: entry,
      output: {path: outputDir},
      circusNamespace: 'Circus',

      externals: {
        'circus': 'Circus'
      }
    };
    config = CircusRouter.config(config);
    config = Circus.config(config);

    webpack(config, function(err, status) {
      expect(err).to.not.exist;
      expect(status.compilation.errors).to.be.empty;
      expect(status.compilation.warnings).to.be.empty;

      expect(status.compilation.chunks.length).to.equal(3);

      done();
    });
  });
  it('should handle typeof', function(done) {
    var config = {
      entry: __dirname + '/../fixtures/eval-loader.js',
      output: {path: outputDir},
      circusNamespace: 'Circus'
    };
    config = CircusRouter.config(config);
    config = Circus.config(config);

    webpack(config, function(err, status) {
      expect(err).to.not.exist;
      expect(status.compilation.errors).to.be.empty;
      expect(status.compilation.warnings).to.be.empty;

      var output = fs.readFileSync(outputDir + '/bundle.js').toString();

      expect(output).to.match(/\(true\)/);
      expect(output).to.match(/"function";/);

      done();
    });
  });
});
