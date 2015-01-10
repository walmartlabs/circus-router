var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  el: 'body',

  render: function() {
    this.$el.html('This returned to the home router. without duplicate load.<br><br>The chunk sizes in this example are small relative to the bootstrap, but this technique is beneficial to non-trivial apps, particularly when the bootstrap is published to a common location as a shared Circus component.');
    return this;
  }
});
