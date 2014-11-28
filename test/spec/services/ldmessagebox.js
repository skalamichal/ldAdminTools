'use strict';

describe('Service: ldMessageBox', function () {

  // load the service's module
  beforeEach(module('ldAdminToolsApp'));

  // instantiate service
  var ldMessageBox;
  beforeEach(inject(function (_ldMessageBox_) {
    ldMessageBox = _ldMessageBox_;
  }));

  it('should do something', function () {
    expect(!!ldMessageBox).toBe(true);
  });

});
