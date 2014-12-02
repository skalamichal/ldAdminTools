'use strict';

describe('Directive: ldExpandableInput', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var element,
		scope;

	beforeEach(inject(function ($rootScope) {
		scope = $rootScope.$new();
	}));

	it('should make hidden element visible', inject(function ($compile) {
		element = angular.element('<ld-expandable-input></ld-expandable-input>');
		element = $compile(element)(scope);

	}));
});
