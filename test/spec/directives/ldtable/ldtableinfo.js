'use strict';

describe('Directive: ldTableInfo', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools', function($controllerProvider) {
		$controllerProvider.register('ldTableController', function() {
			this.page = 3;
			this.rowsPerPage = 8;
			this.rows = 30;
			this.getCurrentPage = jasmine.createSpy('getCurentPage').andCallFake(function() {
				return this.page;
			});
			this.getRowsPerPage = jasmine.createSpy('getRowsPerPage').andCallFake(function() {
				return this.rowsPerPage;
			});
			this.getFilteredRows = jasmine.createSpy('getFilteredRows').andCallFake(function() {
				return this.rows;
			});
		});
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
	}));

	describe('default ld-table-info', function() {

		beforeEach(function() {
			var element = angular.element('<ld-table-info></ld-table-info>');
			ldTable.append(element);
			$element = $compile(element)($rootScope);
			$rootScope.$digest();
			$scope = $element.isolateScope();
		});

		it('should make default element', function() {
			expect($scope.infoText).toBe('17 - 24 of 30 Items')
			expect($element.text().trim()).toBe('17 - 24 of 30 Items');
		});

		it('should be invisible, if there are no rows', function() {
			$scope.$apply(function() {
				ldTableController.rows = 0;
				$rootScope.$broadcast(ldTableController.TABLE_UPDATED);
			});

			expect($scope.isVisible).toBeFalsy();
			expect($element.children().length).toBe(0);
		});
	});

	describe('set text via attribute', function() {

		beforeEach(function() {
			$rootScope.text = '{0} -> {1} of {2}';
			var element = angular.element('<ld-table-info text="{{ text }}"></ld-table-info>');
			ldTable.append(element);
			$element = $compile(element)($rootScope);
			$rootScope.$digest();
			$scope = $element.isolateScope();
		});

		it('should create element', function() {
			expect($scope.infoText).toBe('17 -> 24 of 30');
			expect($element.text().trim()).toBe('17 -> 24 of 30');
		});

		it('should update the text value', function() {
			$scope.$apply(function() {
				$rootScope.text = '{0} az {1} z {2}';
			});

			expect($scope.infoText).toBe('17 az 24 z 30');
			expect($element.text().trim()).toBe('17 az 24 z 30');
		});
	});
});