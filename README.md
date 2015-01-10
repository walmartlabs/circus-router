# circus-router

In-source router parser for [Circus][] components dependencies, allowing for smart runtime behavior such as demand loading of chunks based on the current route. This allows the application to bootstrap from minimal code sent to the client, with only the pertinent code being loaded when the user hits that portion of the site.


## Usage

See the example directory for an example of a complete Backbone application.

### Configuration

Used as a preprocessor for the `Circus.config` method:

```javascript
var Circus = require('circus'),
    CircusRouter = require('circus-router');

var config = {};
config = CircusStylus.config(config);
config = Circus.config(config);
```

### Routers

Routers are the primary execution component for Circus applications. As in generic backbone applications, they allow for specific behaviors to occur in response to the current url of the page.

```javascript
Circus.router({
  routes: {
    '/': 'home',
    '/home': 'home'
  },

  home: function(params) {
    // Respond to the route
  }
});
```

Defines a [Backbone router][backbone-router] on the routes `/` and `/home` but have the important distinction of being parse-able at build time so they may be demand loaded with the `Circus.loader` and integrated into the server routing tables for push state and SSJS support.

This does not necessarily need to be a Backbone router, and can be anything as long as the first parameter is an object with the field `routes` who's keys define routes in a manner that can be consumed by `Circus.loader`.

### Loaders

Loaders serve as entry points into routers. They will demand load a given router and it's dependencies in response to the current route on the page.

```javascript
Circus.loader([
  './home',
  './items'
]);
```

Will generate two different chunks, one for the home router and one for the items route.

Generally a loader is used for simple bootstrapping of an application, along with core libraries.

### Generated Code

The loader will generate a JavaScript construct similar to the following:

```javascript
Circus.loader(__webpack_requre__, moduleJSON);
```

and `Circus.router` calls are not modified at build time. Implementors are expected to provide their own implementations of these methods that integrates with their framework of choice.

For those who wish to use a different root object, the `Circus` name may be changed by passing a `circusNamespace` option to the `Circus.config` compiler method.


[circus]: https://github.com/walmartlabs/circus

