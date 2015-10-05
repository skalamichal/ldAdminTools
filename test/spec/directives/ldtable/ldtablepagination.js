'use strict';

describe('Directive: ldTablePagination', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var $element,
		$scope,
		$rootScope,
		$compile,
		ldTable,
		ldTableController;

	beforeEach(inject(function (_$rootScope_, _$compile_) {
		$rootScope = _$rootScope_.$new();
		$compile = _$compile_;

		ldTable = $compile('<div ld-table="data"></div>')($rootScope);
		ldTableController = ldTable.controller('ldTable');

		spyOn(ldTableController, 'getFilteredRows').andReturn(85);
		spyOn(ldTableController, 'getRowsPerPage').andReturn(10);
		spyOn(ldTableController, 'getCurrentPage').andReturn(3);
		spyOn(ldTableController, 'setPage');
	}));

	describe('default pagination', function () {

		beforeEach(function() {
			var element = angular.element('<ld-table-pagination></ld-table-pagination>');
			ldTable.append(element);

			$element = $compile(element)($rootScope);
			$rootScope.$digest();
			$scope = $element.isolateScope();
		});

		it('should have set default values', function() {
			expect($scope.totalItems).toBe(85);
			expect($scope.itemsPerPage).toBe(10);
			expect($scope.isVisible).toBeTruthy();
			expect($scope.maxSize).toBeNull();
			expect($scope.currentPage).toBe(3);

			$scope.$apply(function(){
				$scope.currentPage = 2;
			});

			expect(ldTableController.getCurrentPage).toHaveBeenCalled();
			expect(ldTableController.setPage).toHaveBeenCalledWith(2);
		});
	});
});
