var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  el: 'body',

  events: {
    'click #explain': function() {
      Backbone.history.navigate('explain', true);
    }
  },

  render: function() {
    this.$el.html('This is one router. It loads one set of files.<br><br>Clicking <button id="explain">here</button> will load another one.');
    return this;
  }
});
