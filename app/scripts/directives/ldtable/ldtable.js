'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTable
 * @description
 * # ldTable
 */
angular.module('ldAdminTools')
/**
 * The controller used in the ld-table directive
 */
	.controller('ldTableController', ['$scope', '$parse', '$filter', '$attrs', 'ldFilterService', function ($scope, $parse, $filter, $attrs, filterService) {
		this.TABLE_UPDATED = 'ldTableUpdated';

		var property = $attrs.ldTable;
		var displayGetter = $parse(property);
		var displaySetter = displayGetter.assign;
		var filterLimit = $filter('limitTo');

		// define filter ID
		var filter = angular.isDefined($attrs.ldFilter) ? $attrs.ldFilter : ('ld-' + Math.round(Math.random() * 150000));

		// define paging filter
		var pagingFilter = $filter('ldPaging');

		// selected rows in collection
		// var selectedRows;

		// the total number of records in collection
		var totalRows;

		// the number of records in filtered collection, can be used for pagination
		var filteredRows;

		var applyLimit = angular.isDefined($attrs.ldTableApplyLimit) ? !!$parse($attrs.ldTableApplyLimit) : true;

		var ctrl = this;

		/**
		 * Makes copy of source array, which is used for filtering, ...
		 * @param src
		 * @returns {Array}
		 */
		function makeCopy(src) {
			if (angular.isUndefined(src)) {
				src = [];
			}
			filteredRows = totalRows = src.length;
			return [].concat(src);
		}

		function updateTableSource(src) {
			dataCopy = makeCopy(src);
			ctrl.filterUpdated();
		}

		// make sure, the display data are defined
		if (angular.isUndefined(displayGetter($scope))) {
			displaySetter($scope, []);
		}

		/**
		 * We have a copy of the data, which is updated, so we don't affect the original collection
		 */
		var dataCopy;

		// check the ld-table-source and add an watcher if exists, so we always update the copy and
		// update the display data
		var ldTableSource = $attrs.ldTableSource;
		if (angular.isDefined(ldTableSource)) {
			var sourceGetter = $parse(ldTableSource);

			// make the copy of the ldTableSource now
			dataCopy = makeCopy(sourceGetter($scope));
			displaySetter($scope, dataCopy);
			filterService.forceUpdate(filter);

			$scope.$watchCollection(function () {
				return sourceGetter($scope);
			}, function (newData) {
				updateTableSource(newData);
			});
		}
		// if no source is defined, watch changes in display data
		else {
			dataCopy = makeCopy(displayGetter($scope));
		}

		var filtered = dataCopy;

		// table paging properties
		var currentPage = 1;
		var rowsPerPage = dataCopy.length;
		var totalPages = 1;
		var paging = false;

		// setup event handler
		$scope.$on(filterService.FILTER_UPDATED, angular.bind(this, function (event, filterId) {
			// call apply if the updated filter is the same as ours
			if (filterId === filter) {
				ctrl.filterUpdated();
			}
		}));

		// if the filter is generated, don't store it and remove, when table is removed
		if (angular.isUndefined($attrs.ldFilter)) {
			$scope.$on('$destroy', function () {
				filterService.removeFilter(filter);
			});
		}

		/**
		 * Return filter used in the table
		 * @returns {*}
		 */
		this.getFilter = function getFilter() {
			return filter;
		};

		/**
		 * Set the number of items/rows displayed on one page
		 * @param rows
		 */
		this.setupPaging = function setPaging(rows, page) {
			paging = true;
			rowsPerPage = rows;
			currentPage = page || 1;

			totalPages = calcTotalPages();

			this.applyPaging();
		};

		function calcTotalPages() {
			var pages = paging ? (rowsPerPage < 1 ? 1 : Math.ceil(filteredRows / rowsPerPage)) : 1;
			return Math.max(pages || 0, 1);
		}

		/**
		 * Remove paging
		 */
		this.clearPaging = function clearPaging() {
			paging = false;
			rowsPerPage = dataCopy.length;
			currentPage = 1;
			totalPages = 1;

			this.applyPaging();
		};

		/**
		 * Set the page number to display
		 * @param page
		 */
		this.setPage = function setPage(page) {
			if (currentPage !== page && page > 0 && page <= totalPages) {
				currentPage = page;
			}

			this.applyPaging();
		};

		/**
		 * Adds the search for field or global, if not defined
		 * @param {String} value to search for
		 * @param {String} the object property, which should be filtered
		 *
		 */
		this.setSearchFilter = function setSearchFilter(value, field) {
			var condition = value;
			if (angular.isDefined(field) && field.length > 0) {
				condition = {};
				condition[field] = value;
			}
			filterService.setWhereCondition(filter, condition);
		};

		/**
		 * Remove the search condition
		 * @param {String} - remove predicate given as string
		 *        {Array} -  remove predicates given as strings in array
		 */
		this.removeSearchFilter = function removeSearchFilter(fields) {
			filterService.removeWhereCondition(filter, fields);
		};

		/**
		 * Clear the search filter
		 */
		this.clearSearchFilter = function clearSearchFilter() {
			filterService.clearWhereFilter(filter);
		};

		/**
		 * Set rows order
		 * @param criterion - String or Array[String]
		 * @param reverse
		 */
		this.setOrderByFilter = function setOrderByFilter(criterion, reverse) {
			filterService.setOrderByCondition(filter, criterion, reverse);
		};

		/**
		 * Remove the order by filter.
		 */
		this.clearOrderByFilter = function clearOrderByFilter() {
			filterService.clearOrderByFilter(filter);
		};

		this.clearFilters = function clearFilters() {
			filterService.clearWhereFilter(filter);
			filterService.clearOrderByFilter(filter);
			rowsPerPage = dataCopy.length;
		};

		this.filterUpdated = function filterUpdated() {
			filtered = filterService.applyFilter(filter, dataCopy);
			filteredRows = filtered.length;

			totalPages = calcTotalPages();
			if (currentPage > totalPages) {
				currentPage = totalPages;
			}

			this.applyPaging();
		};

		/**
		 * Apply paging filters.
		 */
		this.applyPaging = function applyPaging() {
			var display = filtered;

			if (totalPages > 1) {
				display = pagingFilter(display, currentPage, rowsPerPage);
			}

			if (applyLimit && display.length > 50) {
				display = filterLimit(display, 50);
			}

			displaySetter($scope, display);

			$scope.$broadcast(this.TABLE_UPDATED);
		};

		/**
		 * Return the order state
		 * @returns {{}}
		 */
		this.getOrderByFilters = function getOrderByFilters() {
			return filterService.getFilter(filter).combined.order;
		};

		/**
		 * Return the search filters object.
		 * @returns {{}}
		 */
		this.getSearchFilters = function getSearchFilters() {
			return filterService.getFilter(filter).combined.where;
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

		this.getRows = function getRows() {
			return displayGetter($scope);
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
	}]);
