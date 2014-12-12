'use strict';

describe('Directive: ldCheckbox', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var $element,
		$scope;

	beforeEach(inject(function (_$rootScope_) {
		$scope = _$rootScope_.$new();
	}));

	it('should not set the indeterminate in default state', inject(function ($compile) {
		var element = angular.element('<ld-checkbox></ld-checkbox>');
		$element = $compile(element)($scope);
		$scope.$digest();

		expect($element.prop('indeterminate')).toBeFalsy();
	}));

	it('should set the indeterminate state based on the scope value', inject(function($compile) {
		$scope.indeterminate = true;
		var element = angular.element('<ld-checkbox indeterminate="indeterminate"></ld-checkbox>');
		$element = $compile(element)($scope);
		$scope.$digest();

		var scope = $element.isolateScope();

		expect(scope.indeterminate).toBeTruthy();
		expect($element.find('input').prop('indeterminate')).toBeTruthy();

		$scope.indeterminate = false;
		$scope.$digest();
		expect(scope.indeterminate).toBeFalsy();
		expect($element.find('input').prop('indeterminate')).toBeFalsy();

		$scope.indeterminate = true;
		$scope.$digest();
		expect(scope.indeterminate).toBeTruthy();
		expect($element.find('input').prop('indeterminate')).toBeTruthy();
	}));

	it('should set checked and indeterminate to false, when onChanged is called', inject(function($compile) {
		$scope.indeterminate = true;
		$scope.onChanged = jasmine.createSpy('onChanged');
		var element = angular.element('<ld-checkbox indeterminate="indeterminate"></ld-checkbox>');
		$element = $compile(element)($scope);
		$scope.$digest();

		var scope = $element.isolateScope();
		scope.onChanged();
		scope.$digest();

		expect(scope.checked).toBeFalsy();
		expect(scope.indeterminate).toBeFalsy();
		expect($scope.onChanged).not.toHaveBeenCalled();
	}));

	it('should call $scope.onChanged method, when directive onChanged is called', inject(function($compile) {
		$scope.indeterminate = true;
		$scope.onChanged = jasmine.createSpy('onChanged');
		var element = angular.element('<ld-checkbox indeterminate="indeterminate" onchanged="onChanged"></ld-checkbox>');
		$element = $compile(element)($scope);
		$scope.$digest();

		var scope = $element.isolateScope();
		scope.onChanged();
		scope.$digest();

		expect($scope.onChanged).toHaveBeenCalled();
	}));
});
