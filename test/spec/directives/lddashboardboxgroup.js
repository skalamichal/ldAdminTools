'use strict';

describe('Directive: ldDashboardBoxGroup', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var element,
		scope;

	beforeEach(inject(function ($rootScope) {
		scope = $rootScope.$new();
	}));

	it('should make hidden element visible', inject(function ($compile) {
		element = angular.element('<ld-dashboard-box-group></ld-dashboard-box-group>');
		element = $compile(element)(scope);
	}));
});
