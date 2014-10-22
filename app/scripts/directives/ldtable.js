'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTable
 * @description
 * # ldTable
 */
angular.module('ldAdminTools')
/**
 * The ld-paging filters selects items from array based in paging (page number and page rows)
 */
	.filter('ldPaging', function() {
		return function(data, page, rowsPerPage) {
			if (!angular.isArray(data)) {
				return data;
			}

			var fromRow = (page - 1) * rowsPerPage;
			var toRow = fromRow + rowsPerPage;
			return data.slice(fromRow, toRow);
		};
	})
/**
 * The controller used in the ld-table directive
 */
	.controller('ldTableController', ['$scope', '$parse', '$filter', '$attrs', function ($scope, $parse, $filter, $attrs) {
		var property = $attrs.ldTable;
		var displayGetter = $parse(property);
		var displaySetter = displayGetter.assign;

		/**
		 * filters object, with value pairs:
		 * - predicate: value
		 * - predicate is '$' for global filter
		 * @type {{}}
		 */
		var filters = {};

		/**
		 * order by object with following values:
		 * - predicate {String}
		 * - reverse {Boolean}
		 * @type {{}}
		 */
		var orders = {};

		var searchFilter = $filter('filter');
		var orderByFilter = $filter('orderBy');
		var pagingFilter = $filter('ldPaging');

		// selected rows in collection
		// var selectedRows;

		// the total number of records in collection
		var totalRows;

		// the number of records in filtered collection, can be used for pagination
		var filteredRows;

		function makeCopy(src) {
			filteredRows = totalRows = src.length;
			return [].concat(src);
		}

		/**
		 * We have a copy of the data, which is updated, so we don't affect the original collection
		 */
		var dataCopy = makeCopy(displayGetter($scope));

		// table paging properties
		var currentPage = 1;
		var rowsPerPage = dataCopy.length;
		var totalPages = 1;

		/**
		 * Set the number of items/rows displayed on one page
		 * @param rows
		 */
		this.setupPaging = function setPaging(rows, page) {
			rowsPerPage = rows;
			currentPage = page || 1;

			totalPages = calcTotalPages();

			this.applyFilters();
		};

		function calcTotalPages() {
			var pages = rowsPerPage < 1 ? 1 : Math.ceil(filteredRows / rowsPerPage);
			return Math.max(pages || 0, 1);
		}

		/**
		 * Remove paging
		 */
		this.clearPaging = function clearPaging() {
			rowsPerPage = dataCopy.length;
			currentPage = 1;
			totalPages = 1;

			this.applyFilters();
		};

		/**
		 * Set the page number to display
		 * @param page
		 */
		this.setPage = function setPage(page) {
			if (currentPage !== page && page > 0 && page <= totalPages) {
				currentPage = page;
			}

		    this.applyFilters();
		};

		/**
		 * Adds or removes the search
		 * @param {String} value - the value to search, if value is undefined, the filter is removed
		 * @param {String} [predicate] - if not set the '$' is used
		 */
		this.setSearchFilter = function setSearchFilter(value, predicate) {
			var property = angular.isDefined(predicate) ? predicate : '$';
			filters[property] = value;
			if (angular.isUndefined(value)) {
				delete filters[property];
			}

			// reset the currentpage to 1
			currentPage = 1;

			this.applyFilters();
		};

		this.removeSearchFilter = function removeSearchFilter(predicate) {
			var property = angular.isDefined(predicate) ? predicate : '$';
			delete filters[property];

			// reset the currentpage to 1
			currentPage = 1;

			this.applyFilters();
		};

		/**
		 * Clear the search filter
		 */
		this.clearSearchFilter = function clearSearchFilter() {
			filters = {};

			this.applyFilters();
		};

		/**
		 * Set rows order
		 * @param predicate
		 * @param reverse
		 */
		this.setOrderByFilter = function setOrderByFilter(predicate, reverse) {
			orders.predicate = predicate;
			orders.reverse = reverse;

			this.applyFilters();
		};

		/**
		 * Remove the order by filter.
		 */
		this.clearOrderByFilter = function clearOrderByFilter() {
			orders = {};

			this.applyFilters();
		};

		this.clearFilters = function clearFilters() {
			orders = {};
			filters = {};
			currentPage = 1;
			rowsPerPage = dataCopy.length;
			totalPages = 1;

			this.applyFilters();
		};

		/**
		 * Apply defined filters.
		 */
		this.applyFilters = function applyFilters() {
			var filtered = searchFilter(dataCopy, filters);
			var sorted = orderByFilter(filtered, orders.predicate, orders.reverse);

			filteredRows = sorted.length;

			totalPages = calcTotalPages();

			if (totalPages > 1) {
				sorted = pagingFilter(sorted, currentPage, rowsPerPage);
			}

			displaySetter($scope, sorted);
		};

		/**
		 * Return the order state
		 * @returns {{}}
		 */
		this.getOrderByFilters = function getOrderState() {
			return orders;
		};

		/**
		 * Return the search filters object.
		 * @returns {{}}
		 */
		this.getSearchFilters = function getSearchFilters() {
			return filters;
		};

		/**
		 * Return the number of rows when search and order by filters are applied.
		 * @returns {*}
		 */
		this.getFilteredRows = function getFilteredRows() {
			return filteredRows;
		};

		/**
		 * Return the number of rows in original(not filtered) collection.
		 * @returns {*}
		 */
		this.getTotalRows = function getTotalRows() {
			return totalRows;
		};

		/**
		 * Return current displayed page
		 * @returns {Number}
		 */
		this.getCurrentPage = function getCurrentPage() {
			return currentPage;
		};

		/**
		 * Return the number of rows
		 * @returns {Number}
		 */
		this.getRowsPerPage = function getRowsPerPage() {
			return rowsPerPage;
		};

		/**
		 * Return total pages number
		 * @returns {Number}
		 */
		this.getTotalPages = function getTotalPages() {
			return totalPages;
		};
	}])
/**
 * The main ld-table directive
 */
	.directive('ldTable', [function () {
		return {
			restrict: 'A',
			controller: 'ldTableController',
			/*jshint unused:false*/
			link: function (scope, element, attrs, controller) {
			}
		};
	}])
/**
 * The ld-table-search makes a binding between input field and table filter
 * The ld-table-search value is a predicate. If no value is set, the global filter is applied.
 * The ng-model is required to set.
 */
	.directive('ldTableSearch', ['$timeout', function ($timeout) {
		return {
			restrict: 'A',
			require: ['^ldTable', 'ngModel'],
			scope: {
				predicate: '=?ldTableSearch',
				model: '=ngModel'
			},
			link: function (scope, element, attrs, controllers) {
				var tableController = controllers[0];
				var promise;

				// watch the predicate value so we can change is at runtime
				scope.$watch('predicate', function (newValue, oldValue) {
					if (newValue !== oldValue) {
						tableController.removeSearchFilter(oldValue);
						tableController.setSearchFilter(scope.model || '', newValue);
					}
				});

				// method called when the content of ng-model is changed
				// it's using the $timeout service, so we don't update the filter at every change
				function inputChanged() {
					if (promise !== null) {
						$timeout.cancel(promise);
					}

					promise = $timeout(function () {
						tableController.setSearchFilter(scope.model || '', scope.predicate);
						promise = null;
					}, 100);
				}

				// watch for the input changes
				scope.$watch('model', inputChanged);
			}
		};
	}])
/**
 * The ld-table-sort makes a binding between element and table column sorting. The value defines the
 * order by predicate.
 * Optionally you can use the ld-table-sort-default attribute with no value as a default ascent sorting or "reverse"
 * value for descent sorting.
 */
	.directive('ldTableSort', [function () {
		return {
			restrict: 'A',
			require: '^ldTable',
			link: function (scope, element, attrs, tableController) {
				if (angular.isUndefined(attrs.ldTableSort)) {
					return;
				}

				// default classes
				var ascentClass = 'ld-table-sort-ascent';
				var descentClass = 'ld-table-sort-descent';

				// order status enum
				var ORDER = Object.freeze({
					NONE: 0,
					ASCENT: 1,
					DESCENT: 2
				});

				var predicate = attrs.ldTableSort;
				var order = ORDER.NONE;

				// udpate the order if the ld-table-sort-default attribute is set
				if (angular.isDefined(attrs.ldTableSortDefault)) {
					order = attrs.ldTableSortDefault === 'reverse' ? ORDER.DESCENT : ORDER.ASCENT;
				}

				/**
				 * Update the style based on the orderBy status
				 */
				function updateStyle() {
					element.removeClass(ascentClass).removeClass(descentClass);
					if (order === ORDER.ASCENT) {
						element.addClass(ascentClass);
					}
					else if (order === ORDER.DESCENT) {
						element.addClass(descentClass);
					}
				}

				/**
				 * Update element style and apply the orderBy filter.
				 */
				function sort() {
					if (order === ORDER.NONE) {
						tableController.clearOrderByFilter();
					}
					else {
						tableController.setOrderByFilter(predicate, (order === ORDER.DESCENT));
					}
				}

				/**
				 * Change the order when the element is clicked
				 */
				function changeSortOrder() {
					order++;
					if (order > ORDER.DESCENT) {
						order = ORDER.NONE;
					}

					scope.$apply(sort);
				}

				// watch for the table order by filters. When different column is set, update this one.
				scope.$watch(tableController.getOrderByFilters, function (newValue) {
					if (angular.isUndefined(newValue.predicate) || newValue.predicate !== predicate) {
						order = ORDER.NONE;
					}
					updateStyle();
				}, true); // watch also object members

				// bind the click handler to the element
				element.on('click', changeSortOrder);

				// unbind the click handler, when the element is removed
				// clean up!
				scope.$on('$destroy', function () {
					element.off('click', changeSortOrder);
				});

				// initialize
				if (order !== ORDER.NONE) {
					sort();
				}
			}
		};
	}])
/**
 * The ld-table-filter allows to use custom search for the table. The value is a filter object with following data:
 * - name {String}- the filter name (not required here!!!)
 * - filters {Object} optional - with predicate: value pairs
 * - clear {Array} optional - predicates as values, if defined and empty clear the filter (!!!)
 * - divider {Boolean} - if true, the item is a divider in dropdown (not required here!!!)
 */
	.directive('ldTableFilter', ['$parse', function ($parse) {
		return {
			restrict: 'A',
			require: '^ldTable',
			link: function (scope, element, attrs, tableController) {

				var filterGetter = $parse(attrs.ldTableFilter);

				scope.$watch(filterGetter, function (newValue) {
					if (angular.isDefined(newValue)) {

						// if the clear object is defined, first clear the old filter
						if (angular.isDefined(newValue.clear)) {
							// clear all filters
							if (newValue.clear.length === 0) {
								tableController.clearSearchFilter();
							}
							// remove filters
							else {
								angular.forEach(newValue.clear, function (predicate) {
									tableController.removeSearchFilter(predicate);
								});
							}
						}

						// if filters are defined, apply them
						if (angular.isDefined(newValue.filters)) {
							angular.forEach(newValue.filters, function(value, key) {
								tableController.setSearchFilter(value, key);
							});
						}
					}
				}, true);

			}
		};
	}])
/**
 * Setup pagination rowsPerPage for the ld-table, otherwise no pagination is used
 */
	.directive('ldTablePageRows', ['$parse', function($parse) {
		return {
			restrict: 'A',
			require: '^ldTable',
			link: function(scope, element, attrs, tableController) {
				var rowsPerPageGetter = $parse(attrs.ldTablePageRows);

				// watch if the value is changed
				scope.$watch(rowsPerPageGetter, function(newValue) {
					tableController.setupPaging(newValue, 1);
				});
			}
		};
	}])
/**
 * The ld-table-pagination is a plugin to paginate the table. Following values could be set via attributes:
 * - items-per-page {Number} - the max number of rows displayed on the page
 * - max-size {Number} - max number of buttons in paginntion
 * - is-visible {Boolean} - show/hide the pagination
 */
	.directive('ldTablePagination', [function () {
		return {
			restrict: 'EA',
			require: '^ldTable',
			scope: {
				maxSize: '=?',
				isVisible: '=?'
			},
			templateUrl: 'partials/ldtablepagination.html',
			link: function (scope, element, attrs, tableController) {
				// defaylt values used by the angular-ui pagination used by this directive
				scope.totalItems = tableController.getFilteredRows();
				scope.itemsPerPage = tableController.getRowsPerPage();
				scope.maxSize = scope.maxSize || null;

				// allows to show/hide the directive
				scope.isVisible = scope.isVisible || true;

				function setCurrentPage(page) {
					scope.currentPage = page;
					tableController.setPage(page);
				}

				// watch for the current page value, so we can set it in the table
				// it's update by the angular-ui pagination directive
				scope.$watch('currentPage', function (newValue, oldValue) {
					if (newValue !== oldValue) {
						setCurrentPage(newValue);
					}
				});

				// watch for the items/rows change, so we can update the pagination directive
				scope.$watch(tableController.getFilteredRows, function (newValue) {
					scope.totalItems = newValue;
					setCurrentPage(1);
				});

				// watch if the rowsPerPage is changed
				scope.$watch(tableController.getRowsPerPage, function(newValue) {
					scope.itemsPerPage = newValue;
				});

				// initialize
				tableController.setupPaging(scope.itemsPerPage, 1);
			}
		};
	}])
	.constant('ldTableInfoConfig', {
		textDefault: '{0} - {1} of {2} Items'
	})
/**
 * Simple directive which allows to display the range of displayed items. Allows to set the description.
 * Example: 1-20 of 95 Messages
 */
	.directive('ldTableInfo', ['ldTableInfoConfig', function(config) {
		return {
			restrict: 'EA',
			require: '^ldTable',
			templateUrl: 'partials/ldtableinfo.html',
			scope: {
				text: '@'
			},
			link: function(scope, element, attrs, tableController) {

				var infoText = scope.text || config.textDefault;

				// update the scope variables used in the template
				function update() {
					var page = tableController.getCurrentPage();
					var rowsPerPage = tableController.getRowsPerPage();
					var rows = tableController.getFilteredRows();

					var rowFrom = ((page - 1) * rowsPerPage) + 1;
					var rowTo = Math.min(rowFrom - 1 + rowsPerPage, rows);

					var txt = infoText.replace('{0}', rowFrom);
					txt = txt.replace('{1}', rowTo);
					txt = txt.replace('{2}', rows);

					scope.infoText = txt;
				}

				scope.$watch('text', function(value) {
					infoText = value;
					update();
				});

				// watch for table filter updates
				scope.$watch(tableController.getFilteredRows, function() {
					update();
				});

				scope.$watch(tableController.getCurrentPage, function() {
					update();
				});

				// initialize
				update();
			}
		};
	}])
	.constant('ldTableNavigationConfig', {
		showPreviousButtonDefault: true,
		showNextButtonDefault: true
	})
	.directive('ldTableNavigation', ['ldTableNavigationConfig', function (config) {
		return {
			restrict: 'EA',
			require: '^ldTable',
			templateUrl: 'partials/ldtablenavigation.html',
			scope: {
				showPreviousButton: '=?',
				showNextButton: '=?'
			},
			/*jshint unused:false*/
			link: function(scope, element, attrs, tableController) {
				scope.disablePreviousButtonClass = '';
				scope.disableNextButtonClass = '';

				scope.showPreviousButton = scope.showPreviousButton || config.showPreviousButtonDefault;
				scope.showNextButton = scope.showNextButton || config.showNextButtonDefault;

				function updateNavigation() {
					var page = tableController.getCurrentPage();
					scope.disablePreviousButtonClass = (page <= 1 ? 'disabled' : '');
					scope.disableNextButtonClass = (page >= tableController.getTotalPages() ? 'disabled' : '');
				}

				scope.$watch(tableController.getCurrentPage, function() {
					updateNavigation();
				});

				scope.$watch(tableController.getFilteredRows, function() {
					updateNavigation();
				});

				scope.previousPage = function() {
					tableController.setPage(tableController.getCurrentPage() - 1);
				};

				scope.nextPage = function() {
					tableController.setPage(tableController.getCurrentPage() + 1);
				};
			}
		};
	}])
	.constant('ldTableNavigationDropdownConfig', {
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
				description: '=',
				firstPageText: '@',
				lastPageText: '@',
				pageText: '@',
				previousPageText: '@',
				nextPageText: '@'
			},
			/*jshint unused:false*/
			link: function(scope, element, attrs, tableController) {
				// initialized the text variables
				scope.firstPageText = scope.firstPageText || config.firstPageTextDefault;
				scope.lastPageText = scope.lastPageText || config.lastPageTextDefault;
				scope.previousPageText = scope.previousPageText || config.previousPageTextDefault;
				scope.nextPageText = scope.nextPageText || config.nextPageTextDefault;
				var pageText = scope.pageText || config.pageTextDefault;

				// display text
				scope.firstPage = scope.firstPageText;
				scope.lastPage = scope.lastPageText;
				scope.previousPage = scope.previousPageText;
				scope.nextPage = scope.nextPageText;

				// the pages array
				scope.pages = [];

				function updateStyles(obj) {
					scope.firstPageClass = (obj.totalPages > 1 && obj.currentPage > 1) ? '' : 'disabled';
					scope.lastPageClass = (obj.totalPages > 1 && obj.currentPage < obj.totalPages) ? '' : 'disabled';
					scope.previousPageClass = (obj.currentPage > 1) ? '' : 'disabled';
					scope.nextPageClass = (obj.currentPage < obj.totalPages) ? '' : 'disabled';
				}

				function makePage(page, currentPage) {
					var pageObj = {
						page: page,
						text: pageText.replace('{0}', page),
						active: page === currentPage
					};

					return pageObj;
				}

				function makePages(currentPage) {
					var startPage = Math.max(currentPage - 2, 1);
					var endPage = Math.min(currentPage + 2, tableController.getTotalPages());

					if (tableController.getTotalPages() < 5) {
						return;
					}

					var pages = [];

					for (var p = startPage; p<= endPage; p++) {
						var page = makePage(p, currentPage);
						pages.push(page);
					}

					scope.pages = pages;
				}

				scope.gotoPage = function(page) {
					tableController.setPage(page);
				};

				scope.$watch(function() {
					return {
						'totalPages': tableController.getTotalPages(),
						'currentPage': tableController.getCurrentPage(),
						'rows': tableController.getFilteredRows()
					};
				}, function(newValue) {
					scope.totalPages = newValue.totalPages;
					scope.currentPage = newValue.currentPage;
					updateStyles(newValue);
					makePages(newValue.currentPage);
				}, true);
			}
		};
	}]);