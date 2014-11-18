'use strict';

describe('Filter: lfFrom', function () {

  // load the filter's module
  beforeEach(module('ldAdminToolsApp'));

  // initialize a new instance of the filter before each test
  var lfFrom;
  beforeEach(inject(function ($filter) {
    lfFrom = $filter('lfFrom');
  }));

  it('should return the input prefixed with "lfFrom filter:"', function () {
    var text = 'angularjs';
    expect(lfFrom(text)).toBe('lfFrom filter: ' + text);
  });

});
