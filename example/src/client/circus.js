var _ = require('underscore'),
    Backbone = require('backbone');

// Setup the loader router which serves as the first entry point for the while shebang
var Loader = new Backbone.Router();
Backbone.history = new Backbone.History();

function start() {
  if (Backbone.History.started) {
    return;
  }

  Backbone.history.start({
    pushState: false
  });
}

module.exports = {
  router: function(props) {
    return new (Backbone.Router.extend(props))();
  },
  loader: function(webpackRequire, chunkMap) {
    _.each(chunkMap.routes, function(module, route) {
      var chunk = chunkMap.modules[module].chunk;

      Loader.route(route, route, function() {
        // Load the module entry point
        webpackRequire.e(chunk, function() {
          // Exec the module entry point
          webpackRequire(module);

          // Reload with the new route
          Backbone.history.loadUrl();
        });
      });
    });

    // Implicitly start the router in response to a loader call
    start();
  }
};
