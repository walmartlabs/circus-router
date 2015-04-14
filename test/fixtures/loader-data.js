var Circus = require('circus');

Circus.loader({root: '/root'}, [
  './router1.js'
]);
