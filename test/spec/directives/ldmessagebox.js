'use strict';

describe('Directive: ldMessageBox', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var element,
		scope;

	beforeEach(inject(function ($rootScope) {
		scope = $rootScope.$new();
	}));

	it('should make hidden element visible', inject(function ($compile) {
		element = angular.element('<ld-message-box></ld-message-box>');
		element = $compile(element)(scope);
	}));
});
