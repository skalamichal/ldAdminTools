'use strict';

describe('Directive: ldTable', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var ctrl,
		$rootScope,
		$controller,
		ldFilterService;

	beforeEach(inject(function (_$rootScope_, _$controller_, _ldFilterService_) {
		$rootScope = _$rootScope_;
		$controller = _$controller_;
		ldFilterService = _ldFilterService_;
	}));

	function createController() {
		var controller = {
			$scope: $rootScope,
			$attrs: {
				ldTable: 'displayData'
			}
		};

		ctrl = $controller('ldTableController', controller);
		$rootScope.$digest();
	}

	function createControllerWithDisplayData() {
		$rootScope.displayData = createData();
		var controller = {
			$scope: $rootScope,
			$attrs: {
				ldTable: 'displayData',
				ldFilter: 'unittestfilter'
			}
		};

		ctrl = $controller('ldTableController', controller);
		$rootScope.$digest();
	}

	function createControllerWithSourceData() {
		$rootScope.sourceData = createData();
		var controller = {
			$scope: $rootScope,
			$attrs: {
				ldTable: 'displayData',
				ldTableSource: 'sourceData',
				ldFilter: 'unittestfilter'
			}
		};

		ctrl = $controller('ldTableController', controller);
		$rootScope.$digest();
	}

	function createData() {
		return [
			{
				firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com', age: 20
			},
			{
				firstname: 'Peter', lastname: 'Parker', email: 'peter.parker@example.com', age: 30
			},
			{
				firstname: 'Josh', lastname: 'Hutcherson', email: 'josh.hutch@example.com', age: 25
			},
			{
				firstname: 'Donald', lastname: 'Sutherland', email: 'donald.suther@example.com', age: 61
			},
			{
				firstname: 'Jennifer', lastname: 'Lawrence', email: 'jenny.lawrence@example.com', age: 26
			},
			{
				firstname: 'Willow', lastname: 'Shields', email: 'willow.shields@example.com', age: 16
			},
			{
				firstname: 'Will', lastname: 'Smith', email: 'will.smith@example.com', age: 20
			}
		];
	}

	it('should define the "displayData" scope variable', function () {
		createController();
		expect($rootScope.displayData).toBeDefined();
		expect(ctrl.getFilter()).not.toBe('unittestfilter');
	});

	it('should copy source data to "displayData"', function () {
		createControllerWithSourceData();

		expect($rootScope.displayData).toBeDefined();
		expect($rootScope.displayData).toEqual($rootScope.sourceData);
		expect(ctrl.getFilter()).toBe('unittestfilter');
	});

	describe('work with display data', function () {
		beforeEach(function () {
			createControllerWithDisplayData();
		});

		it('should always use the same data, even when external data are changed', function () {
			expect(ctrl.getRows()).toEqual(createData());

			var changed = [{id: 1}, {id: 3}];
			$rootScope.displayData = [].concat(changed);
			$rootScope.$digest();

			expect(ctrl.getRows()).toEqual(changed);

			ctrl.filterUpdated();
			$rootScope.$digest();

			expect(ctrl.getRows()).not.toEqual(changed);
		});

		it('should set paging for the table and navigate through pages', function () {
			spyOn(ctrl, 'applyPaging').andCallThrough();
			ctrl.setupPaging(3, 2);
			$rootScope.$digest();

			expect(ctrl.applyPaging).toHaveBeenCalled();
			expect(ctrl.getRowsPerPage()).toBe(3);
			expect(ctrl.getCurrentPage()).toBe(2);
			expect(ctrl.getTotalPages()).toBe(3);
			expect($rootScope.displayData.length).toBe(3);
			expect(ctrl.getRows().length).toBe(3);
			expect(ctrl.getRows()).toEqual([
				{
					firstname: 'Donald', lastname: 'Sutherland', email: 'donald.suther@example.com', age: 61
				},
				{
					firstname: 'Jennifer', lastname: 'Lawrence', email: 'jenny.lawrence@example.com', age: 26
				},
				{
					firstname: 'Willow', lastname: 'Shields', email: 'willow.shields@example.com', age: 16
				}
			]);

			ctrl.setPage(3);
			$rootScope.$digest();

			expect(ctrl.getCurrentPage()).toBe(3);
			expect($rootScope.displayData.length).toBe(1);
			expect(ctrl.getRows()).toEqual([
				{
					firstname: 'Will', lastname: 'Smith', email: 'will.smith@example.com', age: 20
				}
			]);

			ctrl.setPage(20);
			$rootScope.$digest();

			expect(ctrl.getCurrentPage()).toBe(3);

			ctrl.clearPaging();

			expect(ctrl.getRowsPerPage()).toBe(7);
			expect(ctrl.getCurrentPage()).toBe(1);
			expect(ctrl.getTotalPages()).toBe(1);
			expect(ctrl.getRows()).toEqual(createData());
		});
	});

	describe('work with filters', function () {

		beforeEach(function () {
			createControllerWithDisplayData();
		});

		it('should work with filters', function () {
			spyOn(ldFilterService, 'setWhereCondition').andCallThrough();
			spyOn(ldFilterService, 'removeWhereCondition').andCallThrough();
			spyOn(ldFilterService, 'clearWhereFilter').andCallThrough();
			spyOn(ldFilterService, 'setOrderByCondition').andCallThrough();
			spyOn(ldFilterService, 'clearOrderByFilter').andCallThrough();

			spyOn(ctrl, 'filterUpdated').andCallThrough();
			spyOn(ctrl, 'applyPaging').andCallThrough();

			ctrl.setSearchFilter('example.com');
			expect(ldFilterService.setWhereCondition).toHaveBeenCalledWith('unittestfilter', 'example.com');

			ctrl.setSearchFilter('Jo', 'firstname');
			$rootScope.$digest();
			expect(ldFilterService.setWhereCondition).toHaveBeenCalledWith('unittestfilter', {firstname: 'Jo'});
			expect(ctrl.getFilteredRows()).toBe(2);

			ctrl.removeSearchFilter('name');
			expect(ldFilterService.removeWhereCondition).toHaveBeenCalledWith('unittestfilter', 'name');

			ctrl.removeSearchFilter(['name', '$']);
			expect(ldFilterService.removeWhereCondition).toHaveBeenCalledWith('unittestfilter', ['name', '$']);

			ctrl.clearSearchFilter();
			expect(ldFilterService.clearWhereFilter).toHaveBeenCalledWith('unittestfilter');

			ctrl.setOrderByFilter('+name', false);
			expect(ldFilterService.setOrderByCondition).toHaveBeenCalledWith('unittestfilter', '+name', false);

			ctrl.setOrderByFilter(['+name', '-date'], true);
			expect(ldFilterService.setOrderByCondition).toHaveBeenCalledWith('unittestfilter', ['+name', '-date'], true);

			ctrl.clearOrderByFilter();
			expect(ldFilterService.clearOrderByFilter).toHaveBeenCalledWith('unittestfilter');

			expect(ctrl.filterUpdated).toHaveBeenCalled();
			expect(ctrl.applyPaging).toHaveBeenCalled();
		});
	});

	describe('work with display data', function () {
		beforeEach(function () {
			createControllerWithSourceData();
		});

		it('should update "display data" when "source" has been changed', function () {
			$rootScope.$apply(function () {
				$rootScope.sourceData.push({
					firstname: 'John', lastname: 'Rambo', email: 'john.rambo@example.com', age: 45
				});
			});
			$rootScope.$digest();

			expect($rootScope.displayData.length).toBe(8);

			// sey new data
			$rootScope.$apply(function () {
				$rootScope.sourceData = [
					{id: 1}, {id: 2}
				];
			});
			expect($rootScope.displayData.length).toBe(2);
			expect($rootScope.displayData).toEqual($rootScope.sourceData);

		});
	});

});
