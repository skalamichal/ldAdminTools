'use strict';

describe('Directive: ldTableFilter', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var element,
		scope;

	beforeEach(inject(function ($rootScope) {
		scope = $rootScope.$new();
	}));

	it('should make hidden element visible', inject(function ($compile) {
		element = angular.element('<ld-table-filter></ld-table-filter>');
		element = $compile(element)(scope);

	}));
});
