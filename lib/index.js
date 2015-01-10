var _ = require('lodash'),
    LoaderPlugin = require('./plugins/loader');

module.exports.config = function(additions) {
  return _.defaults({
    circusNamespace: additions.circusNamespace || 'Circus',

    plugins: plugins(additions.plugins)
  }, additions);
};

function plugins(additions) {
  var base = [
    new LoaderPlugin()
  ];

  return additions ? base.concat(additions) : base;
}
