var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  el: 'body',

  events: {
    'click #home': function() {
      Backbone.history.navigate('more', true);
    }
  },

  render: function() {
    this.$el.html('This is another router. On navigation, it loaded it\'s own javascript and once completed, executed.<br><br>Clicking <button id="home">here</button> will return to the prior, without loading again.');
    return this;
  }
});
