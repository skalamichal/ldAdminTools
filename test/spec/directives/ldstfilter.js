'use strict';

describe('Directive: ldStFilter', function () {

  // load the directive's module
  beforeEach(module('ldAdminToolsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ld-st-filter></ld-st-filter>');
    element = $compile(element)(scope);
  }));
});
