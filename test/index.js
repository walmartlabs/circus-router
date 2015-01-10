var CircusRouter = require('circus-router'),
    expect = require('chai').expect;

describe('circus-router', function() {
  describe('config', function() {
    it('should apply additions', function() {
      var config = {
        circusNamespace: 'foo',
        plugins: [1]
      };
      config = CircusRouter.config(config);
      expect(config.circusNamespace).to.equal('foo');
      expect(config.plugins[1]).to.equal(1);
    });
  });
});
