'use strict';

describe('Filter: ldSelect', function () {

  // load the filter's module
  beforeEach(module('ldAdminTools'));

  // initialize a new instance of the filter before each test
  var ldSelect;
  beforeEach(inject(function ($filter) {
    ldSelect = $filter('ldSelect');
  }));

  it('should return the input prefixed with "ldSelect filter:"', function () {
  });

});
