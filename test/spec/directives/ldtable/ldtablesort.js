'use strict';

describe('Directive: ldTableSort', function () {

  // load the directive's module
  beforeEach(module('ldAdminTools'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ld-table-sort></ld-table-sort>');
    element = $compile(element)(scope);
  }));
});
