'use strict';

describe('Filter: ldPaging', function () {

  // load the filter's module
  beforeEach(module('ldAdminTools'));

  // initialize a new instance of the filter before each test
  var ldPading;
  beforeEach(inject(function ($filter) {
    ldPading = $filter('ldPaging');
  }));

  it('should return the input prefixed with "ldPaging filter:"', function () {
    var text = 'angularjs';
  });

});
