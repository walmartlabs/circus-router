var Circus = require('circus'),
    CircusRouter = require('../');

var config = CircusRouter.config({
  entry: './src/client/index.js',
  output: {
    path: './build/',
    filename: 'example.js'
  }
});
module.exports = Circus.config(config);
