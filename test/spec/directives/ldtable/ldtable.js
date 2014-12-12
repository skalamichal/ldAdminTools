'use strict';

describe('Directive: ldTable', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools', function ($provide) {
		var ldFilterService = {
			getFilter: jasmine.createSpy('getFilter').andCallThrough(),
			removeFilter: jasmine.createSpy('removeFilter').andCallThrough(),
			forceUpdate: jasmine.createSpy('forceUpdate').andCallThrough(),
			setWhereCondition: jasmine.createSpy('setWhereCondition').andCallThrough(),
			removeWhereCondition: jasmine.createSpy('removeWhereCondition').andCallThrough(),
			clearWhereCondition: jasmine.createSpy('clearWhereCondition').andCallThrough(),
			setOrderByCondition: jasmine.createSpy('setOrderByCondition').andCallThrough(),
			clearOrderByFilter: jasmine.createSpy('clearOrderByFilter').andCallThrough(),
			applyFilter: jasmine.createSpy('applyFilter').andCallThrough()
		};

		//$provide.factory('ldFilterService', function () {
	//		return ldFilterService;
	//	});
	}));

	var scope,
		ctrl,
		$controller,
		$parse,
		$filter,
		ldFilterService;

	beforeEach(inject(function (_$rootScope_, _$controller_, _$parse_, _$filter_, _ldFilterService_) {
		scope = _$rootScope_.$new();

		$controller = _$controller_;
		$parse = _$parse_;
		$filter = _$filter_;
		ldFilterService = _ldFilterService_;
	}));

	function createController() {
		var controller = {
			$scope: scope,
			$parse: $parse,
			$filter: $filter,
			$attrs: {
				ldTable: 'displayData'
			},
			ldFilterService: ldFilterService
		};

		ctrl = $controller('ldTableController', controller);
		scope.$digest();
	}

	function createControllerWithDisplayData() {
		scope.displayData = createData();
		var controller = {
			$scope: scope,
			$parse: $parse,
			$filter: $filter,
			$attrs: {
				ldTable: 'displayData',
				ldFilter: 'unittestfilter'
			},
			ldFilterService: ldFilterService
		};

		ctrl = $controller('ldTableController', controller);
		scope.$digest();
	}

	function createControllerWithSourceData() {
		scope.sourceData = createData();
		var controller = {
			$scope: scope,
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
		scope.$digest();
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
		expect(scope.displayData).toBeDefined();
		expect(ctrl.getFilter()).not.toBe('unittestfilter');
	});

	it('should copy source data to "displayData"', function () {
		createControllerWithSourceData();

		expect(scope.displayData).toBeDefined();
		expect(scope.displayData).toEqual(scope.sourceData);
		expect(ctrl.getFilter()).toBe('unittestfilter');
	});

	describe('work with display data', function() {
		beforeEach(function() {
			createControllerWithDisplayData();
		});

		it('should always use the same data, even when external data are changed', function() {
			expect(ctrl.getRows()).toEqual(createData());

			var changed = [{id: 1}, {id: 3}];
			scope.displayData = [].concat(changed);
			scope.$digest();

			expect(ctrl.getRows()).toEqual(changed);

			ctrl.filterUpdated();
			scope.$digest();

			expect(ctrl.getRows()).not.toEqual(changed);
		});
	});

});
