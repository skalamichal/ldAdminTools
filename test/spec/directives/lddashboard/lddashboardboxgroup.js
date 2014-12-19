'use strict';

describe('Directive: ldDashboardBoxGroup', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var element,
		scope;

	beforeEach(inject(function ($rootScope) {
		scope = $rootScope.$new();
	}));

	it('should create the element', inject(function ($compile) {
		element = angular.element('<ld-dashboard-box-group>Some Content</ld-dashboard-box-group>');
		element = $compile(element)(scope);
		scope.$digest();

		expect(element).toHaveClass('ld-panel-group');
		expect(element.text().trim()).toBe('Some Content');
	}));
});
