'use strict';

describe('Directive: ldTableNavigationDropdown', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools', function ($controllerProvider) {
		$controllerProvider.register('ldTableController', function() {
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
		$scope,
		$compile,
		ldTable,
		ldTableController,
		config;

	beforeEach(inject(function (_$rootScope_, _$compile_, _ldTableNavigationDropdownConfig_) {
		$rootScope = _$rootScope_;
		$compile = _$compile_;
		config = _ldTableNavigationDropdownConfig_;

		ldTable = $compile(angular.element('<div ld-table="data"></div>'))($rootScope);
		ldTableController = ldTable.controller('ldTable');
	}));

	describe('default ldTableNavigationDropdown', function () {

		beforeEach(function () {
			var element = angular.element('<ld-table-navigation-dropdown></ld-table-navigation-dropdown>');
			ldTable.append(element);

			$element = $compile(element)($rootScope);
			$rootScope.$digest();
			$scope = $element.isolateScope();
		});

		it('should have default options on the scope', function () {
			expect($scope.firstPageText).toBe(config.firstPageTextDefault);
			expect($scope.lastPageText).toBe(config.lastPageTextDefault);
			expect($scope.previousPageText).toBe(config.previousPageTextDefault);
			expect($scope.nextPageText).toBe(config.nextPageTextDefault);

			expect($scope.firstPage).toBe($scope.firstPageText);
			expect($scope.lastPage).toBe($scope.lastPageText);
			expect($scope.previousPage).toBe($scope.previousPageText);
			expect($scope.nextPage).toBe($scope.nextPageText);

			expect($scope.totalPages).toBe(15);
			expect($scope.currentPage).toBe(5);

			expect($scope.pages.length).toBe(5);
			expect(angular.copy($scope.pages)).toEqual([
				{page: 3, text: 'Page 3', active: false},
				{page: 4, text: 'Page 4', active: false},
				{page: 5, text: 'Page 5', active: true},
				{page: 6, text: 'Page 6', active: false},
				{page: 7, text: 'Page 7', active: false}
			]);
		});

		it('should check html code for default options', function () {
			expect($element.find('a').eq(0).text().trim()).toBe('Page 5 of 15');
			expect($element.find('li').length).toBe(9);

			var li = $element.find('li');
			expect(li.eq(0)).not.toHaveClass('divider');
			expect(li.eq(0).text().trim()).toBe($scope.firstPage);
			expect(li.eq(1).text().trim()).toBe($scope.previousPage);
			expect(li.eq(2).text().trim()).toBe('Page 3');
			expect(li.eq(4)).toHaveClass('divider');
			expect(li.eq(7).text().trim()).toBe($scope.nextPage);
			expect(li.eq(8).text().trim()).toBe($scope.lastPage);
		});

		it('should call the table setPage method', function () {
			$scope.$apply(function () {
				$scope.gotoPage(8);
			});
			expect(ldTableController.setPage).toHaveBeenCalledWith(8);
		});

		it('should disable navigation links based on current page value', function () {
			// first page
			$scope.$apply(function () {
				$scope.gotoPage(1);
				$rootScope.$broadcast(ldTableController.TABLE_UPDATED);
			});
			expect(ldTableController.setPage).toHaveBeenCalledWith(1);
			$rootScope.$digest();

			expect($scope.firstPageClass).toBe('disabled');
			expect(ldTableController.getCurrentPage()).toBe(1);

			var li = $element.find('li');
			expect(li.eq(0)).toHaveClass('disabled');
			expect(li.eq(1)).toHaveClass('disabled');

			expect(angular.copy($scope.pages)).toEqual([
				{page: 1, text: 'Page 1', active: true},
				{page: 2, text: 'Page 2', active: false},
				{page: 3, text: 'Page 3', active: false}
			]);

			// last page
			$scope.$apply(function () {
				$scope.gotoPage(15);
				$rootScope.$broadcast(ldTableController.TABLE_UPDATED);
			});
			expect(ldTableController.setPage).toHaveBeenCalledWith(15);
			$rootScope.$digest();

			li = $element.find('li');
			expect(li.eq(0)).not.toHaveClass('disabled');
			expect(li.eq(1)).not.toHaveClass('disabled');

			expect(li.eq(5)).toHaveClass('disabled');
			expect(li.eq(6)).toHaveClass('disabled');

			expect(angular.copy($scope.pages)).toEqual([
				{page: 13, text: 'Page 13', active: false},
				{page: 14, text: 'Page 14', active: false},
				{page: 15, text: 'Page 15', active: true}
			]);

			// second page
			$scope.$apply(function () {
				$scope.gotoPage(2);
				$rootScope.$broadcast(ldTableController.TABLE_UPDATED);
			});
			expect(ldTableController.setPage).toHaveBeenCalledWith(2);
			$rootScope.$digest();

			li = $element.find('li');
			expect(li.eq(0)).not.toHaveClass('disabled');
			expect(li.eq(1)).not.toHaveClass('disabled');

			expect(li.eq(6)).not.toHaveClass('disabled');
			expect(li.eq(7)).not.toHaveClass('disabled');

			expect(angular.copy($scope.pages)).toEqual([
				{page: 1, text: 'Page 1', active: false},
				{page: 2, text: 'Page 2', active: true},
				{page: 3, text: 'Page 3', active: false},
				{page: 4, text: 'Page 4', active: false}
			]);
		});

	});

	describe('pages less than 5', function () {

		beforeEach(function () {
			ldTableController.totalPages = 4;
			ldTableController.page = 2;
			var element = angular.element('<ld-table-navigation-dropdown></ld-table-navigation-dropdown>');
			ldTable.append(element);

			$element = $compile(element)($rootScope);
			$rootScope.$digest();
			$scope = $element.isolateScope();
		});

		it('should have only first, prev, next, last items in list', function() {
			var li = $element.find('li');
			expect(li.eq(0)).not.toHaveClass('disabled');
			expect(li.eq(1)).not.toHaveClass('disabled');

			expect(li.eq(2)).not.toHaveClass('disabled');
			expect(li.eq(3)).not.toHaveClass('disabled');

			expect(angular.copy($scope.pages)).toEqual([]);
		});

	});

	describe('just one page', function() {
		beforeEach(function () {
			ldTableController.totalPages = 1;
			ldTableController.page = 1;
			var element = angular.element('<ld-table-navigation-dropdown></ld-table-navigation-dropdown>');
			ldTable.append(element);

			$element = $compile(element)($rootScope);
			$rootScope.$digest();
			$scope = $element.isolateScope();
		});

		it('should have only first, prev, next, last items in list', function() {
			var li = $element.find('li');
			expect(li.eq(0)).toHaveClass('disabled');
			expect(li.eq(1)).toHaveClass('disabled');
			expect(li.eq(2)).toHaveClass('disabled');
			expect(li.eq(3)).toHaveClass('disabled');

			expect(angular.copy($scope.pages)).toEqual([]);
		});

	});

	describe('set options ldTableNavigationDropdown', function () {

		beforeEach(function () {
			$rootScope.description = 'Pg. {0} of {1}';
			$rootScope.firstPageText = 'First pg.';
			$rootScope.lastPageText = 'Last pg.';
			$rootScope.previousPageText = 'Prev pg.';
			$rootScope.nextPageText = 'Next pg.';
			$rootScope.pageText = 'Pg. {0}';
			var element = angular.element('<ld-table-navigation-dropdown description="{{ description }}" first-page-text="{{ firstPageText }}" last-page-text="{{ lastPageText }}" previous-page-text="{{ previousPageText }}" next-page-text="{{ nextPageText }}" page-text="{{ pageText }}"></ld-table-navigation-dropdown>');
			ldTable.append(element);

			$element = $compile(element)($rootScope);
			$rootScope.$digest();
			$scope = $element.isolateScope();
		});

		it('should have default options on the scope', function () {
			expect($scope.firstPageText).toBe($rootScope.firstPageText);
			expect($scope.lastPageText).toBe($rootScope.lastPageText);
			expect($scope.previousPageText).toBe($rootScope.previousPageText);
			expect($scope.nextPageText).toBe($rootScope.nextPageText);

			expect($scope.firstPage).toBe($scope.firstPageText);
			expect($scope.lastPage).toBe($scope.lastPageText);
			expect($scope.previousPage).toBe($scope.previousPageText);
			expect($scope.nextPage).toBe($scope.nextPageText);

			expect($scope.totalPages).toBe(15);
			expect($scope.currentPage).toBe(5);

			expect($scope.pages.length).toBe(5);
			expect(angular.copy($scope.pages)).toEqual([
				{page: 3, text: 'Pg. 3', active: false},
				{page: 4, text: 'Pg. 4', active: false},
				{page: 5, text: 'Pg. 5', active: true},
				{page: 6, text: 'Pg. 6', active: false},
				{page: 7, text: 'Pg. 7', active: false}
			]);
		});

		it('should check html code for default options', function () {
			expect($element.find('a').eq(0).text().trim()).toBe('Pg. 5 of 15');
			expect($element.find('li').length).toBe(9);

			var li = $element.find('li');
			expect(li.eq(0)).not.toHaveClass('divider');
			expect(li.eq(0).text().trim()).toBe($scope.firstPage);
			expect(li.eq(1).text().trim()).toBe($scope.previousPage);
			expect(li.eq(2).text().trim()).toBe('Pg. 3');
			expect(li.eq(4)).toHaveClass('divider');
			expect(li.eq(7).text().trim()).toBe($scope.nextPage);
			expect(li.eq(8).text().trim()).toBe($scope.lastPage);
		});
	});
});
