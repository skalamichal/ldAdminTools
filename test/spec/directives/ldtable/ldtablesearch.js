'use strict';

describe('Directive: ldTableSearch', function () {

  // load the directive's module
  beforeEach(module('ldAdminTools'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ld-table-search></ld-table-search>');
    element = $compile(element)(scope);
  }));
});
