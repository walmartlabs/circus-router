var Circus = require('./circus'),
    HomeView = require('./views/home'),
    MoreView = require('./views/home-more');

Circus.router({
  routes: {
    '': 'home',
    'more': 'more'
  },

  home: function() {
    var view = new HomeView();
    view.render();
  },
  more: function() {
    var view = new MoreView();
    view.render();
  }
});
