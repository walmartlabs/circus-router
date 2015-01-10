var Circus = require('./circus'),
    ExplainView = require('./views/explain');

Circus.router({
  routes: {
    'explain': 'explain',
  },

  explain: function(options) {
    var view = new ExplainView();
    view.render();
  }
});
