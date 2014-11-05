'use strict';

describe('Service: ldCache', function () {

  // load the service's module
  beforeEach(module('ldAdminToolsApp'));

  // instantiate service
  var ldCache;
  beforeEach(inject(function (_ldCache_) {
    ldCache = _ldCache_;
  }));

  it('should do something', function () {
    expect(!!ldCache).toBe(true);
  });

});
