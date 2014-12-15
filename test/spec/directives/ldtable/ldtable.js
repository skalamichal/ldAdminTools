'use strict';

describe('Directive: ldTable', function () {

	// load the directive's module
	var ldFilterServiceMock;
	beforeEach(module('ldAdminTools', function ($provide) {
		ldFilterServiceMock = {
			getFilter: jasmine.createSpy('getFilter'),
			removeFilter: jasmine.createSpy('removeFilter'),
			forceUpdate: jasmine.createSpy('forceUpdate'),
			setWhereCondition: jasmine.createSpy('setWhereCondition'),
			removeWhereCondition: jasmine.createSpy('removeWhereCondition'),
			clearWhereCondition: jasmine.createSpy('clearWhereCondition'),
			setOrderByCondition: jasmine.createSpy('setOrderByCondition'),
			clearOrderByFilter: jasmine.createSpy('clearOrderByFilter'),
			applyFilter: jasmine.createSpy('applyFilter')
		};

		//$provide.value('ldFilterService', ldFilterServiceMock);
	}));

	var ctrl,
		$rootScope,
		$controller,
		$parse,
		$filter,
		ldFilterService;

	beforeEach(inject(function (_$rootScope_, _$controller_, _$parse_, _$filter_, _ldFilterService_) {
		$rootScope = _$rootScope_;
		$controller = _$controller_;
		$parse = _$parse_;
		$filter = _$filter_;
		ldFilterService = _ldFilterService_;
	}));

	function createController() {
		var controller = {
			$scope: $rootScope,
			$parse: $parse,
			$filter: $filter,
			$attrs: {
				ldTable: 'displayData'
			},
			ldFilterService: ldFilterService
		};

		ctrl = $controller('ldTableController', controller);
		$rootScope.$digest();
	}

	function createControllerWithDisplayData() {
		$rootScope.displayData = createData();
		var controller = {
			$scope: $rootScope,
			$parse: $parse,
			$filter: $filter,
			$attrs: {
				ldTable: 'displayData',
				ldFilter: 'unittestfilter'
			},
			ldFilterService: ldFilterService
		};

		ctrl = $controller('ldTableController', controller);
		$rootScope.$digest();
	}

	function createControllerWithSourceData() {
		$rootScope.sourceData = createData();
		var controller = {
			$scope: $rootScope,
			$parse: $parse,
			$filter: $filter,
			$attrs: {
				ldTable: 'displayData',
				ldTableSource: 'sourceData',
				ldFilter: 'unittestfilter'
			},
			ldFilterService: ldFilterService
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

	describe('work with display data', function() {
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

	describe('work with filters', function() {

		beforeEach(function () {
			createControllerWithDisplayData();
		});

		it('should work with filters', function() {
			spyOn(ldFilterService, 'setWhereCondition');
			spyOn(ldFilterService, 'removeWhereCondition');
			spyOn(ldFilterService, 'clearWhereFilter');

			ctrl.setSearchFilter('Michal');
			expect(ldFilterService.setWhereCondition).toHaveBeenCalledWith('unittestfilter', 'Michal');

			ctrl.setSearchFilter('Michal', '$');
			expect(ldFilterService.setWhereCondition).toHaveBeenCalledWith('unittestfilter', {$: 'Michal'});

			ctrl.removeSearchFilter('name');
			expect(ldFilterService.removeWhereCondition).toHaveBeenCalledWith('unittestfilter', 'name');

			ctrl.removeSearchFilter(['name', '$']);
			expect(ldFilterService.removeWhereCondition).toHaveBeenCalledWith('unittestfilter', ['name', '$']);

			ctrl.clearSearchFilter();
			expect(ldFilterService.clearWhereFilter).toHaveBeenCalledWith('unittestfilter');
		});
	});

});
