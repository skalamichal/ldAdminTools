'use strict';

describe('Directive: ldMessageBox', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var $scope,
		$rootScope;

	beforeEach(inject(function (_$rootScope_) {
		$rootScope = _$rootScope_;
		$scope = _$rootScope_.$new();
	}));

	function getContent(element) {
		return element.find('div').eq(0);
	}

	it('should create default message box', inject(function ($compile) {
		var element = angular.element('<ld-message-box></ld-message-box>');
		element = $compile(element)($scope);

		$rootScope.$digest();

		expect(element.hasClass('ld-message-box')).toBeTruthy();

		var content = getContent(element);

		expect(content.hasClass('ld-message-box-content')).toBeTruthy();
		expect(content.hasClass('ld-message-box-default')).toBeTruthy();

		var i = content.find('i').eq(0);
		expect(i.hasClass('fa')).toBeFalsy();
		expect(i.hasClass('fa-lg')).toBeFalsy();
		expect(i.hasClass('fa-spin')).toBeFalsy();
		expect(i.hasClass('fa-fw')).toBeFalsy();

		expect(content.text()).toBe(' enter message');
	}));

	it('should create defined message', inject(function($compile) {
		$rootScope.message = 'Loading';
		$rootScope.icon = 'fa-loading';
		$rootScope.spin = true;
		$rootScope.type = 'loading';

		var element = angular.element('<ld-message-box></ld-message-box>');
		element.attr({
			message: $rootScope.message,
			type: $rootScope.type,
			icon: $rootScope.icon,
			spin: $rootScope.spin
		});
		element = $compile(element)($rootScope);

		$rootScope.$digest();

		expect(element.hasClass('ld-message-box')).toBeTruthy();

		var content = getContent(element);

		expect(content.hasClass('ld-message-box-loading')).toBeTruthy();

		var i = content.find('i').eq(0);

		expect(i.hasClass('fa')).toBeTruthy()
		expect(i.hasClass('fa-lg')).toBeTruthy()
		expect(i.hasClass('fa-spin')).toBeTruthy()
		expect(i.hasClass('fa-fw')).toBeTruthy()
		expect(i.hasClass('fa-loading')).toBeTruthy();

		expect(content.text()).toBe(' Loading');
	}));
});
