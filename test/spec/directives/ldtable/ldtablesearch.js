'use strict';

describe('Directive: ldTableSearch', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var $element,
		$rootScope,
		$compile,
		$timeout,
		ldTable,
		ldTableController;

	beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_) {
		$rootScope = _$rootScope_.$new();
		$compile = _$compile_;
		$timeout = _$timeout_;

		ldTable = $compile(angular.element('<div ld-table="data"></div>'))($rootScope);
		ldTableController = ldTable.controller('ldTable');

		spyOn(ldTableController, 'removeSearchFilter');
		spyOn(ldTableController, 'setSearchFilter');
	}));

	describe('global search', function () {

		beforeEach(function () {
			$rootScope.value = '';
			var element = angular.element('<input ng-model="value" ld-table-search>');
			ldTable.append(element);

			$element = $compile(element)($rootScope);
			$rootScope.$digest();
		});

		it('should not search when no value is set', function () {
			expect(ldTableController.setSearchFilter).not.toHaveBeenCalled();
			expect(ldTableController.removeSearchFilter).not.toHaveBeenCalled();
		});

		it('should watch for value changes and update search, with timeout of 200ms', function () {
			$rootScope.value = 'Jo';
			$rootScope.$digest();
			$timeout.flush(100);
			expect(ldTableController.setSearchFilter).not.toHaveBeenCalled();
			expect(ldTableController.removeSearchFilter).not.toHaveBeenCalled();

			$timeout.flush(100);
			expect(ldTableController.setSearchFilter).toHaveBeenCalledWith('Jo', undefined);
			expect(ldTableController.removeSearchFilter).not.toHaveBeenCalled();
		});
	});

	describe('set search value on compile time', function () {
		beforeEach(function () {
			$rootScope.value = 'Jo';
			var element = angular.element('<input ng-model="value" ld-table-search>');
			ldTable.append(element);

			$element = $compile(element)($rootScope);
			$rootScope.$digest();
		});

		it('should set the search', function () {
			expect(ldTableController.setSearchFilter).not.toHaveBeenCalled();
			expect(ldTableController.removeSearchFilter).not.toHaveBeenCalled();

			$timeout.flush(200);
			expect(ldTableController.setSearchFilter).toHaveBeenCalledWith('Jo', undefined);
			expect(ldTableController.removeSearchFilter).not.toHaveBeenCalled();
		});
	});

	describe('set search by field name', function () {
		beforeEach(function () {
			var element = angular.element('<input ng-model="value" ld-table-search="\'name\'">');
			ldTable.append(element);

			$element = $compile(element)($rootScope);
			$rootScope.$digest();
		});

		it('should search by field name', function () {
			expect(ldTableController.setSearchFilter).not.toHaveBeenCalled();
			expect(ldTableController.removeSearchFilter).not.toHaveBeenCalled();

			$rootScope.$apply(function () {
				$rootScope.value = 'Jo';
			});
			$timeout.flush(200);

			expect(ldTableController.setSearchFilter).toHaveBeenCalledWith('Jo', 'name');
			expect(ldTableController.removeSearchFilter).not.toHaveBeenCalled();
		});
	});

	describe('change the search field', function () {
		beforeEach(function () {
			$rootScope.field = 'name';
			var element = angular.element('<input ng-model="value" ld-table-search="field">');
			ldTable.append(element);

			$element = $compile(element)($rootScope);
			$rootScope.$digest();
		});

		it('should search by field name and allow to change the search by condition', function () {
			expect(ldTableController.setSearchFilter).not.toHaveBeenCalled();
			expect(ldTableController.removeSearchFilter).not.toHaveBeenCalled();

			$rootScope.$apply(function () {
				$rootScope.value = 'Jo';
			});
			$timeout.flush(200);
			expect(ldTableController.setSearchFilter).toHaveBeenCalledWith('Jo', 'name');
			expect(ldTableController.removeSearchFilter).not.toHaveBeenCalled();

			// change the field name
			$rootScope.$apply(function () {
				$rootScope.field = 'email';
			});
			expect(ldTableController.setSearchFilter).toHaveBeenCalledWith('Jo', 'email');
			expect(ldTableController.removeSearchFilter).toHaveBeenCalledWith('name');

		});
	});
});
