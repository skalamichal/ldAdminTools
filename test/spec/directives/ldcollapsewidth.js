'use strict';

describe('Directive: ldCollapseWidth', function () {

  // load the directive's module
  beforeEach(module('ldAdminToolsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ld-collapse-width></ld-collapse-width>');
    element = $compile(element)(scope);
  }));
});
