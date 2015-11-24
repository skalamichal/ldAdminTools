'use strict';

describe('Directive: ldDropdown', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	function createList() {
		return [
			{
				name: 'test1'
			},
			{
				name: 'test2'
			},
			{
				divider: true
			},
			{
				name: 'test3'
			}
		];
	}

	var $element,
		$scope,
		$document;

	beforeEach(inject(function ($rootScope, _$document_) {
		$scope = $rootScope.$new();
		$document = _$document_;
	}));

	it('should work in the default state', inject(function ($compile) {
		$scope.onChanged = jasmine.createSpy('onChanged');
		var element = angular.element('<ld-dropdown list="" onchanged="onChanged"></ld-dropdown>');
		$element = $compile(element)($scope);
		$scope.$digest();

		expect($scope.onChanged).not.toHaveBeenCalled();

		expect($element.find('li').length).toBe(0);
		expect($element.find('a').text()).toBe(' ');
	}));

	it('should select first in the list, when selected is not defined', inject(function ($compile) {
		$scope.list = createList();
		$scope.onChanged = jasmine.createSpy('onChanged');
		var element = angular.element('<ld-dropdown list="list" onchanged="onChanged"></ld-dropdown>');
		$element = $compile(element)($scope);
		$scope.$digest();

		expect($scope.onChanged).toHaveBeenCalledWith($scope.list[0]);

		expect($element.find('li').length).toBe(4);
		expect($element.find('a').eq(0).text()).toBe('test1 ');

		expect($element.find('li').eq(2).hasClass('divider')).toBeTruthy();
		expect($element.find('li').eq(0).find('a').eq(0).text()).toBe('test1');
		expect($element.find('li').eq(1).find('a').eq(0).text()).toBe('test2');
		expect($element.find('li').eq(3).find('a').eq(0).text()).toBe('test3');
	}));

	it('should select defined item', inject(function ($compile) {
		$scope.list = createList();
		$scope.selected = $scope.list[3];
		var element = angular.element('<ld-dropdown list="list" selected="selected"></ld-dropdown>');
		$element = $compile(element)($scope);
		$scope.$digest();

		expect($element.find('li').length).toBe(4);
		expect($element.find('a').eq(0).text()).toBe('test3 ');

		expect($element.find('li').eq(2).hasClass('divider')).toBeTruthy();
		expect($element.find('li').eq(0).find('a').eq(0).text()).toBe('test1');
		expect($element.find('li').eq(1).find('a').eq(0).text()).toBe('test2');
		expect($element.find('li').eq(3).find('a').eq(0).text()).toBe('test3');
	}));
});
