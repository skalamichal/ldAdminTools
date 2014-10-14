'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTable
 * @description
 * # ldTable
 */
angular.module('ldAdminTools')
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

		// selected rows in collection
		var selectedRows;

		// the total number of records in collection
		var totalRows;

		// the number of records in filtered collection, can be used for pagination
		var filteredRows;

		/**
		 * limit visible rows, can be used by for pagination, ... with following values:
		 * - from {Number} - start from row number
		 * - rows {Number} - number of rows to be displayed
		 * @type {{}}
		 */
		var display;

		/**
		 * We have a copy of the data, which is updated, so we don't affect the original collection
		 */
		var dataCopy = makeCopy(displayGetter($scope));

		function makeCopy(src) {
			filteredRows = totalRows = src.length;
			return [].concat(src);
		}

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

			this.applyFilters();
		};

		this.removeSearchFilter = function removeSearchFilter(predicate) {
			var property = angular.isDefined(predicate) ? predicate : '$';
			delete filters[property];

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

		/**
		 * Set the display rows range.
		 * @param from
		 * @param rows
		 */
		this.setDisplayRange = function setDisplayRange(from, rows) {
			display = {from: from, rows: rows};

			this.applyFilters();
		};

		/**
		 * Clear the display rows range.
		 */
		this.clearDisplayRange = function clearDisplayRange() {
			display = undefined;

			this.applyFilters();
		};

		this.clearFilters = function clearFilters() {
			orders = {};
			filters = {};
			display = undefined;

			this.applyFilters();
		};

		/**
		 * Apply defined filters.
		 */
		this.applyFilters = function applyFilters() {
			var filtered = searchFilter(dataCopy, filters);
			var sorted = orderByFilter(filtered, orders.predicate, orders.reverse);

			filteredRows = sorted.length;

			if (angular.isDefined(display)) {
				sorted = sorted.slice(display.from, display.from + display.rows);
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
	}])
	.directive('ldTable', [function () {
		return {
			restrict: 'A',
			controller: 'ldTableController',
			link: function (scope, element, attrs, controller) {
			}
		};
	}])
	.directive('ldTableSearch', ['$timeout', function ($timeout) {
		return {
			restrict: 'A',
			require: '^ldTable',
			scope: {
				predicate: '=?ldTableSearch'
			},
			link: function (scope, element, attrs, tableController) {
				var promise;

				scope.$watch('predicate', function (newValue, oldValue) {
					if (newValue !== oldValue) {
						tableController.removeSearchFilter(oldValue);
						tableController.setSearchFilter(element[0].value || '', newValue);
					}
				});

				function inputChanged(evt) {
					if (promise !== null) {
						$timeout.cancel(promise);
					}

					promise = $timeout(function () {
						tableController.setSearchFilter(element[0].value || '', scope.predicate);
						promise = null;
					}, 100);
				}

				element.on('input', inputChanged);

				scope.$on('$destroy', function () {
					element.off('input', inputChanged);
				});
			}
		};
	}])
	.directive('ldTableSort', ['$parse', function ($parse) {
		return {
			restrict: 'A',
			require: '^ldTable',
			link: function (scope, element, attrs, tableController) {
				if (angular.isUndefined(attrs.ldTableSort)) {
					return;
				}

				var ascentClass = 'ld-table-sort-ascent';
				var descentClass = 'ld-table-sort-descent';

				var ORDER = Object.freeze({
					NONE: 0,
					ASCENT: 1,
					DESCENT: 2
				});

				var predicate = attrs.ldTableSort;
				var order = ORDER.NONE;

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

				scope.$watch(tableController.getOrderByFilters, function (newValue, oldValue) {
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
	.directive('ldTableFilter', [function () {
		return {
			restrict: 'A',
			require: '^ldTable',
			scope: {
				predicate: '=ldTableFilter'
			},
			link: function (scope, element, link, tableController) {

				scope.$watch('predicate', function (newValue, oldValue) {
					if (angular.isDefined(newValue)) {
						if (angular.isDefined(newValue.value)) {
							tableController.setSearchFilter(newValue.value, newValue.predicate);
						}
						else {
							tableController.removeSearchFilter(newValue.predicate);
						}
					}
				}, true);

			}
		}
	}])
	.directive('ldTablePagination', [function () {
		return {
			restrict: 'EA',
			require: '^ldTable',
			scope: {
				itemsPerPage: '=?',
				maxSize: '=?',
				isVisible: '=?'
			},
			template: '<div class="ld-table-pagination"><pagination class="ld-pagination" ng-show="__numPages > 1 && isVisible" num-pages="__numPages" ng-model="currentPage" max-size="maxSize" total-items="totalItems" items-per-page="itemsPerPage" boundary-links="true" previous-text="&lsaquo;" next-text="&rsaquo;" first-text="&laquo;" last-text="&raquo;"></pagination></div>',
			link: function (scope, element, attrs, tableController) {
				scope.totalItems = tableController.getFilteredRows();
				scope.itemsPerPage = scope.itemsPerPage || 10;
				scope.maxSize = scope.maxSize || null;

				scope.isVisible = scope.isVisible || true;

				function setCurrentPage(page) {
					scope.currentPage = page;
					tableController.setDisplayRange((page - 1) * scope.itemsPerPage, scope.itemsPerPage);
				}

				scope.$watch('currentPage', function (newValue, oldValue) {
					if (newValue !== oldValue) {
						setCurrentPage(newValue);
					}
				});

				scope.$watch(tableController.getFilteredRows, function (newValue, oldValue) {
					scope.totalItems = newValue;
					setCurrentPage(1);
				});

				// initialize
				setCurrentPage(1);
			}
		};
	}]);