'use strict';

describe('Directive: ldTableNavigation', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var element,
		scope;

	beforeEach(inject(function ($rootScope) {
		scope = $rootScope.$new();
	}));

	it('should make hidden element visible', inject(function ($compile) {
		element = angular.element('<ld-table-navigation></ld-table-navigation>');
		element = $compile(element)(scope);
	}));
});
