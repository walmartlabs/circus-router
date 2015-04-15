var NullDependency = require('webpack/lib/dependencies/NullDependency');

function RequireRouterListing(data, blocks, expr, resource) {
  NullDependency.call(this);
  this.Class = RequireRouterListing;
  this.data = data;
  this.blocks = blocks;
  this.expr = expr;
  this.range = expr.range;
  this.resource = resource;
}
module.exports = RequireRouterListing;

RequireRouterListing.prototype = Object.create(NullDependency.prototype);
RequireRouterListing.prototype.type = 'require.router';

RequireRouterListing.prototype.updateHash = function(hash) {
  // We need to invalidate our content when the upstream file changes. Since we don't know if
  // the particular change impacted the routing table as well.
  this.blocks.forEach(function(block) {
    block.dependencies.forEach(function(dependency) {
      if (dependency.module) {
        hash.update(dependency.module.buildTimestamp + '');
      }
    });
  });
};


RequireRouterListing.Template = function RequireRouterListingTemplate(routeMap, compilation) {
  this.routeMap = routeMap;
  this.compilation = compilation;
};

RequireRouterListing.Template.prototype.apply = function(dep, source) {
  var content = {modules: {}, routes: {}},
      compilation = this.compilation,
      namespace = compilation.options.circusNamespace,
      resource = dep.resource,
      expr = dep.expr;

  dep.blocks.forEach(function(block) {
    var module = block.dependencies[0].module;
    if (!module) {
      return;
    }

    block.parent.fileDependencies.push(module.resource);

    var routeMap = this.routeMap[module.resource];
    if (!routeMap) {
      compilation.warnings.push(new Error(resource + ':' + expr.loc.start.line + ' - ' + namespace + '.loader used to load module "`' + block.depName + '" declaring no routes'));
      return;
    }

    RequireRouterListing.extractMap(module, block, routeMap, content);
  }, this);

  if (dep.data) {
    // Strip the root JSON object syntax so we can construct our own.
    content = JSON.stringify(content).replace(/^\{|\}$/g, '');

    // Break this into multiple components that will build around the data source component if one exists
    source.replace(dep.range[0], dep.data.range[0] - 1, namespace + '.loader(__webpack_require__, {"data":');
    source.replace(dep.data.range[1], dep.range[1] - 1, ',' + content + '})');
  } else {
    source.replace(dep.range[0], dep.range[1] - 1, namespace + '.loader(__webpack_require__, ' + JSON.stringify(content) + ')');
  }
};


RequireRouterListing.extractMap = function(module, block, routeMap, content) {
  routeMap.forEach(function(route) {
    if (!content.modules[module.id]) {
      /*istanbul ignore next */
      var chunk = block.chunks ? block.chunks[0] : block.chunk;
      content.modules[module.id] = {chunk: chunk.id};
    }
    content.routes[route] = module.id;
  });
};
