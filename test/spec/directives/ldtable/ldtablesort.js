'use strict';

describe('Directive: ldTableSort', function () {

	// load the directive's module
	var tblMock;
	beforeEach(module('ldAdminTools'));

	var $element,
		$rootScope,
		$compile,
		$controller,
		ldTableController,
		ldTable;

	beforeEach(inject(function (_$rootScope_, _$compile_, _$controller_) {
		$rootScope = _$rootScope_;
		$compile = _$compile_;
		$controller = _$controller_;

		ldTable = $compile(angular.element('<div ld-table="data"></div>'))($rootScope);
		ldTableController = ldTable.controller('ldTable');
	}));

	describe('ldTableSort', function() {
		beforeEach(function() {
			var element = angular.element('<div ld-table-sort="name">Name</div>');
			ldTable.append(element);

			$element = $compile(element)($rootScope);
			$rootScope.$digest();
		});

		it('should set sorting to element', function() {
			expect($element).not.toHaveClass('ld-table-sort-ascent');
			expect($element).not.toHaveClass('ld-table-sort-descent')
		});

		it('should trigger click and change sorting', function() {
			spyOn(ldTableController, 'setOrderByFilter');
			spyOn(ldTableController, 'clearOrderByFilter');

			$element.triggerHandler('click');
			$rootScope.$digest();
			expect($element).toHaveClass('ld-table-sort-ascent');
			expect(ldTableController.setOrderByFilter).toHaveBeenCalledWith('+name', false);

			$element.triggerHandler('click');
			$rootScope.$digest();

			expect($element).toHaveClass('ld-table-sort-descent');
			expect(ldTableController.setOrderByFilter).toHaveBeenCalledWith('-name', false);

			$element.triggerHandler('click');
			$rootScope.$digest();
			expect($element).not.toHaveClass('ld-table-sort-ascent');
			expect($element).not.toHaveClass('ld-table-sort-descent');
			expect(ldTableController.clearOrderByFilter).toHaveBeenCalled();
		});

	});

});
