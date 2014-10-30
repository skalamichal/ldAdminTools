'use strict';

describe('Directive: ldTableNavigationDropdown', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var element,
		scope;

	beforeEach(inject(function ($rootScope) {
		scope = $rootScope.$new();
	}));

	it('should make hidden element visible', inject(function ($compile) {
		element = angular.element('<ld-table-navigation-dropdown></ld-table-navigation-dropdown>');
		element = $compile(element)(scope);
	}));
});
