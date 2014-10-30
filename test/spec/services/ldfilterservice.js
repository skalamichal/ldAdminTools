'use strict';

describe('Service: ldFilterService', function () {

  // load the service's module
  beforeEach(module('ldAdminTools'));

  // instantiate service
  var ldFilterService;
  beforeEach(inject(function (_ldFilterService_) {
    ldFilterService = _ldFilterService_;
  }));

  it('should do something', function () {
	  expect(!!ldFilterService).toBe(true);
  });

});
