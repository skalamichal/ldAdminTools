'use strict';

describe('Directive: ldTablePageRows', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var $element,
		$rootScope,
		$compile,
		ldTable,
		ldTableController;

	beforeEach(inject(function (_$rootScope_, _$compile_) {
		$rootScope = _$rootScope_;
		$compile = _$compile_;

		ldTable = $compile(angular.element('<div ld-table="data"></div>'))($rootScope);
		ldTableController = ldTable.controller('ldTable');

		spyOn(ldTableController, 'setupPaging');

		$rootScope.rows = 10;
		var element = angular.element('<div ld-table-page-rows="rows"></div>');
		ldTable.append(element);

		$element = $compile(element)($rootScope);
		$rootScope.$digest();
	}));

	it('should set the paging values', function() {
		expect(ldTableController.setupPaging).toHaveBeenCalledWith(10, 1);

		$rootScope.$apply(function() {
			$rootScope.rows = 20;
		});

		expect(ldTableController.setupPaging).toHaveBeenCalledWith(20, 1);
	});
});
