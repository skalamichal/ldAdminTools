'use strict';

describe('Directive: ldTableNavigation', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools', function ($controllerProvider) {
		$controllerProvider.register('ldTableController', function () {
			this.page = 5;
			this.totalPages = 15;
			this.getTotalPages = jasmine.createSpy('getTotalPages').andCallFake(function () {
				return this.totalPages;
			});
			this.getCurrentPage = jasmine.createSpy('getCurrentPage').andCallFake(function () {
				return this.page;
			});
			this.setPage = jasmine.createSpy('setPage').andCallFake(function (pg) {
				this.page = pg;
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

	describe('default ld-table-navigation', function () {

		beforeEach(function () {
			var element = angular.element('<ld-table-navigation></ld-table-navigation>');
			ldTable.append(element);

			$element = $compile(element)($rootScope);
			$rootScope.$digest();
			$scope = $element.isolateScope();
		});

		it('should make default element', function () {
			expect($scope.disablePreviousButtonClass).not.toBe('disabled');
			expect($scope.disableNextButtonClass).not.toBe('disabled');

			expect($scope.showPreviousButton).toBeTruthy();
			expect($scope.showNextButton).toBeTruthy();

			expect($element.find('a').eq(0)).not.toHaveClass('disabled');
			expect($element.find('a').eq(1)).not.toHaveClass('disabled');
		});

		it('should disable previous button', function () {
			ldTableController.page = 1;
			$rootScope.$apply(function () {
				$rootScope.$broadcast(ldTableController.TABLE_UPDATED);
			});

			expect($scope.disablePreviousButtonClass).toBe('disabled');
			expect($element.find('a').eq(0)).toHaveClass('disabled');
			expect($element.find('a').eq(1)).not.toHaveClass('disabled');
		});

		it('should disable next button', function () {
			ldTableController.page = 15;
			$rootScope.$apply(function () {
				$rootScope.$broadcast(ldTableController.TABLE_UPDATED);
			});

			expect($scope.disableNextButtonClass).toBe('disabled');
			expect($element.find('a').eq(0)).not.toHaveClass('disabled');
			expect($element.find('a').eq(1)).toHaveClass('disabled');
		});

	});

	describe('ld-table-navigation options test', function () {

		beforeEach(function () {
			$rootScope.showPrev = false;
			$rootScope.showNext = false;
			var element = angular.element('<ld-table-navigation show-next-button="showPrev" show-previous-button="showNext"></ld-table-navigation>');
			ldTable.append(element);

			$element = $compile(element)($rootScope);
			$rootScope.$digest();
			$scope = $element.isolateScope();
		});

		it('should remove previous and next buttons', function () {
			expect($scope.showPreviousButton).toBeFalsy()
			expect($scope.showNextButton).toBeFalsy()

			expect($element.find('a').length).toBe(0);
		});

	});

	describe('test navigation', function () {

		beforeEach(function () {
			var element = angular.element('<ld-table-navigation></ld-table-navigation>');
			ldTable.append(element);

			$element = $compile(element)($rootScope);
			$rootScope.$digest();
			$scope = $element.isolateScope();
		});

		it('should navigate to the first page and disable prev button', function () {
			ldTableController.page = 2;
			$rootScope.$apply(function () {
				$rootScope.$broadcast(ldTableController.TABLE_UPDATED);
			});

			$rootScope.$apply(function () {
				$scope.previousPage();
				$rootScope.$broadcast(ldTableController.TABLE_UPDATED);
			})

			expect(ldTableController.setPage).toHaveBeenCalledWith(1);
			expect(ldTableController.getCurrentPage()).toBe(1);

			expect($scope.disablePreviousButtonClass).toBe('disabled');

			var a = $element.find('a').eq(0);
			expect(a).toHaveClass('disabled');
		});

		it('should navigate to the last page and disable next button', function () {
			ldTableController.page = 14;
			$rootScope.$apply(function () {
				$rootScope.$broadcast(ldTableController.TABLE_UPDATED);
			});

			$rootScope.$apply(function () {
				$scope.nextPage();
				$rootScope.$broadcast(ldTableController.TABLE_UPDATED);
			})

			expect(ldTableController.setPage).toHaveBeenCalledWith(15);
			expect(ldTableController.getCurrentPage()).toBe(15);

			expect($scope.disableNextButtonClass).toBe('disabled');

			var a = $element.find('a').eq(1);
			expect(a).toHaveClass('disabled');
		});

	});

});
