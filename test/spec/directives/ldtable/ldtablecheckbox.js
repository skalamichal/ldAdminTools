'use strict';

describe('Directive: ldTableCheckbox', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools', function($controllerProvider) {
		$controllerProvider.register('ldTableController', function () {
			this.rows = [
				{id: 1},
				{id: 2},
				{id: 3},
				{id: 4},
				{id: 5}
			];
			this.getRows = jasmine.createSpy('getRows').andCallFake(function() {
				return this.rows;
			});
		})
	}));

	var $element,
		$rootScope,
		$compile,
		$scope,
		ldTable,
		ldTableController;

	beforeEach(inject(function (_$rootScope_, _$compile_) {
		$rootScope = _$rootScope_;
		$compile = _$compile_;

		ldTable = $compile(angular.element('<div ld-table="data"></div>'))($rootScope);
		ldTableController = ldTable.controller('ldTable');

		var element = angular.element('<ld-table-checkbox></ld-table-checkbox>');
		ldTable.append(element);
		$element = $compile(element)($rootScope);

		$rootScope.$digest();
		$scope = $element.scope();
	}));

	it('should create checkbox', function() {
		expect($element.find('input').eq(0).attr('type')).toBe('checkbox');
	});

	it('should select all items', function() {
		$scope.updateSelection(true);
		expect(ldTableController.getRows()).toEqual([
			{id: 1, selected: true},
			{id: 2, selected: true},
			{id: 3, selected: true},
			{id: 4, selected: true},
			{id: 5, selected: true}
		]);
	});

	it('should unselect all items', function() {
		$scope.updateSelection(false);
		expect(ldTableController.getRows()).toEqual([
			{id: 1, selected: false},
			{id: 2, selected: false},
			{id: 3, selected: false},
			{id: 4, selected: false},
			{id: 5, selected: false}
		]);
	});

	it('should set the checkbox to indeterminate state', function() {
		$scope.$apply(function() {
			ldTableController.getRows()[3].selected = true;
			$rootScope.$broadcast(ldTableController.TABLE_UPDATED);
		});

		expect($scope.isIndeterminate).toBeTruthy();
		expect($scope.isChecked).toBeFalsy();

		expect($element.find('input').eq(0).prop('indeterminate')).toBeTruthy();
		expect($element.find('input').eq(0).prop('checked')).toBeFalsy();
	});

	it('should set the checkbox to checked state and back to unchecked state', function() {
		$scope.$apply(function() {
			$scope.updateSelection(true);
			$rootScope.$broadcast(ldTableController.TABLE_UPDATED);
		});

		expect($scope.isIndeterminate).toBeFalsy();
		expect($scope.isChecked).toBeTruthy();

		expect($element.find('input').eq(0).prop('indeterminate')).toBeFalsy();
		expect($element.find('input').eq(0).prop('checked')).toBeTruthy();

		$scope.$apply(function() {
			$scope.updateSelection(false);
			$rootScope.$broadcast(ldTableController.TABLE_UPDATED);
		});

		expect($scope.isIndeterminate).toBeFalsy();
		expect($scope.isChecked).toBeFalsy();

		expect($element.find('input').eq(0).prop('indeterminate')).toBeFalsy();
		expect($element.find('input').eq(0).prop('checked')).toBeFalsy();
	});

});
