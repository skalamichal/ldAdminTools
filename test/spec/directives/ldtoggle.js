'use strict';

describe('Directive: ldToggle', function () {

  // load the directive's module
  beforeEach(module('ldAdminToolsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ld-toggle></ld-toggle>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the ldToggle directive');
  }));
});
