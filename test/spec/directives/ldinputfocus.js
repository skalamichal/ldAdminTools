'use strict';

describe('Directive: ldInputFocus', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var element,
		$rootScope,
		$timeout;

	beforeEach(inject(function (_$rootScope_, _$timeout_) {
		$rootScope = _$rootScope_;
		$timeout = _$timeout_;
	}));

	it('should set focus to the input field', inject(function ($compile, $document) {
		$rootScope.focus = false;
		element = angular.element('<input type="text" ld-input-focus="focus">');
		element = $compile(element)($rootScope);
		$document.append(element);
		$rootScope.$digest();

		spyOn(element[0], 'focus');
		$rootScope.focus = true;
		$rootScope.$digest();
		$timeout.flush();

		expect(element[0].focus).toHaveBeenCalled();
	}));

	it('should not set focus to the input field', inject(function ($compile, $document) {
		$rootScope.focus = true;
		element = angular.element('<input type="text" ld-input-focus="focus">');
		element = $compile(element)($rootScope);
		$document.append(element);
		$rootScope.$digest();
		$timeout.flush();

		spyOn(element[0], 'focus');
		$rootScope.focus = false;
		$rootScope.$digest();

		expect(element[0].focus).not.toHaveBeenCalled();
	}));
});
