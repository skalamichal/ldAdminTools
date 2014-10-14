'use strict';

describe('Directive: ldFilterDropdown', function () {

  // load the directive's module
  beforeEach(module('ldAdminToolsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ld-filter-dropdown></ld-filter-dropdown>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the ldFilterDropdown directive');
  }));
});
