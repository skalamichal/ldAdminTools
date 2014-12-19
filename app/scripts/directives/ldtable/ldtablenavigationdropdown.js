'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTableNavigationDropdown
 * @description
 * # ldTableNavigationDropdown
 * Allows do navigate with a dropdown.
 */
angular.module('ldAdminTools')
	.constant('ldTableNavigationDropdownConfig', {
		descriptionDefault: 'Page {0} of {1}',  // default description, where {0} is replaced with the current page number
												// and {1} with the total page count
		firstPageTextDefault: 'First Page',
		lastPageTextDefault: 'Last Page',
		pageTextDefault: 'Page {0}',
		previousPageTextDefault: 'Previous Page',
		nextPageTextDefault: 'Next Page'
	})
	.directive('ldTableNavigationDropdown', ['ldTableNavigationDropdownConfig', function (config) {
		return {
			restrict: 'EA',
			require: '^ldTable',
			templateUrl: 'partials/ldtablenavigationdropdown.html',
			scope: {
				description: '@',
				firstPageText: '@',
				lastPageText: '@',
				pageText: '@',
				previousPageText: '@',
				nextPageText: '@'
			},
			/*jshint unused:false*/
			link: function (scope, element, attrs, tableController) {
				// initialized the text variables
				scope.firstPageText = scope.firstPageText || config.firstPageTextDefault;
				scope.lastPageText = scope.lastPageText || config.lastPageTextDefault;
				scope.previousPageText = scope.previousPageText || config.previousPageTextDefault;
				scope.nextPageText = scope.nextPageText || config.nextPageTextDefault;
				var pageText = scope.pageText || config.pageTextDefault;
				var descriptionText = scope.description || config.descriptionDefault;

				// display text
				scope.firstPage = scope.firstPageText;
				scope.lastPage = scope.lastPageText;
				scope.previousPage = scope.previousPageText;
				scope.nextPage = scope.nextPageText;

				// the pages array
				scope.pages = [];

				scope.updateStyles = function() {
					var totalPages = tableController.getTotalPages();
					var currentPage = tableController.getCurrentPage();
					scope.firstPageClass = (totalPages > 1 && currentPage > 1) ? '' : 'disabled';
					scope.lastPageClass = (totalPages > 1 && currentPage < totalPages) ? '' : 'disabled';
					scope.previousPageClass = (currentPage > 1) ? '' : 'disabled';
					scope.nextPageClass = (currentPage < totalPages) ? '' : 'disabled';
					var desc = descriptionText.replace('{0}', currentPage);
					desc = desc.replace('{1}', totalPages);
					scope.descriptionText = desc;
				}

				function makePage(page, currentPage) {
					var pageObj = {
						page: page,
						text: pageText.replace('{0}', page),
						active: page === currentPage
					};

					return pageObj;
				}

				function makePages() {
					var currentPage = tableController.getCurrentPage();
					var startPage = Math.max(currentPage - 2, 1);
					var endPage = Math.min(currentPage + 2, tableController.getTotalPages());

					if (tableController.getTotalPages() < 5) {
						return;
					}

					var pages = [];

					for (var p = startPage; p <= endPage; p++) {
						var page = makePage(p, currentPage);
						pages.push(page);
					}

					scope.pages = pages;
				}

				scope.update = function() {
					scope.totalPages = tableController.getTotalPages();
					scope.currentPage = tableController.getCurrentPage();
					scope.updateStyles();
					makePages();
				};

				scope.gotoPage = function (page) {
					if (tableController.getCurrentPage() !== page) {
						tableController.setPage(page);
					}
				};

				scope.$on(tableController.TABLE_UPDATED, function () {
					scope.update();
				});

				// update first
				scope.update();

			}
		};
	}]);