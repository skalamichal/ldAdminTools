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
	.filter('ldPaging', function () {
		return function (data, page, rowsPerPage) {
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
	.controller('ldTableController', ['$scope', '$parse', '$filter', '$attrs', 'ldFilterService', function ($scope, $parse, $filter, $attrs, filterService) {

		this.TABLE_UPDATED = 'ldTableUpdated';

		var property = $attrs.ldTable;
		var displayGetter = $parse(property);
		var displaySetter = displayGetter.assign;

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

		var ctrl = this;

		/**
		 * Makes copy of source array, which is used for filtering, ...
		 * @param src
		 * @returns {Array}
		 */
		function makeCopy(src) {
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
		var dataCopy = makeCopy(displayGetter($scope));

		// check the ld-table-source and add an watcher if exists, so we always update the copy and
		// update the display data
		var ldTableSource = $attrs.ldTableSource;
		if (angular.isDefined(ldTableSource)) {
			var sourceGetter = $parse(ldTableSource);

			// make the copy of the ldTableSource now
			dataCopy = makeCopy(sourceGetter($scope));

			// setup the watcher
			$scope.$watch(function () {
				return sourceGetter($scope);
			}, function (newData, oldData) {
				if (newData !== oldData) {
					updateTableSource(newData);
				}
			}, true);
		}

		var filtered = dataCopy;

		// table paging properties
		var currentPage = 1;
		var rowsPerPage = dataCopy.length;
		var totalPages = 1;

		// setup event handler
		$scope.$on(filterService.FILTER_UPDATED, angular.bind(this, function (event, filterId) {
			// call apply if the updated filter is the same as ours
			if (filterId === filter) {
				this.filterUpdated();
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
			rowsPerPage = rows;
			currentPage = page || 1;

			totalPages = calcTotalPages();

			this.applyPaging();
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
		 * Adds the search criterion
		 * @param {String} value to search for
		 * @param {String} the object property, which should be filtered
		 *
		 */
		this.setSearchFilter = function setSearchFilter(value, predicate) {
			var criterion = value;
			if (angular.isDefined(predicate) && predicate.length > 0) {
				criterion = {};
				criterion[predicate] = value;
			}
			filterService.addFilterFilterCriterion(filter, criterion);
		};

		/**
		 * Remove the search criterion
		 * @param {String} - remove predicate given as string
		 *        {Object} - remove predicates given as object pairs
		 *        {Array} - remove predicates, each array value is a predicate
		 */
		this.removeSearchFilter = function removeSearchFilter(criterion) {
			filterService.removeFilterFilterCriterion(filter, criterion);
		};

		/**
		 * Clear the search filter
		 */
		this.clearSearchFilter = function clearSearchFilter() {
			filterService.clearFilterFilter(filter);
		};

		/**
		 * Set rows order
		 * @param criterion
		 * @param reverse
		 */
		this.setOrderByFilter = function setOrderByFilter(criterion, reverse) {
			filterService.addOrderByFilterCriterion(filter, criterion, reverse);
		};

		/**
		 * Remove the order by filter.
		 */
		this.clearOrderByFilter = function clearOrderByFilter() {
			filterService.clearOrderByFilter(filter);
		};

		this.clearFilters = function clearFilters() {
			filterService.clearFilterFilter(filter);
			filterService.clearOrderByFilter(filter);
			rowsPerPage = dataCopy.length;
		};

		this.filterUpdated = function filterUpdated() {
			filtered = filterService.applyFilter(filter, dataCopy);
			filteredRows = filtered.length;

			currentPage = 1;
			totalPages = calcTotalPages();

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

			displaySetter($scope, display);

			$scope.$broadcast(this.TABLE_UPDATED);
		};

		/**
		 * Return the order state
		 * @returns {{}}
		 */
		this.getOrderByFilters = function getOrderByFilters() {
			return filterService.getFilter(filter).orderBy;
		};

		/**
		 * Return the search filters object.
		 * @returns {{}}
		 */
		this.getSearchFilters = function getSearchFilters() {
			return filterService.getFilter(filter).filter;
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
 * The ld-table-search makes a binding between input field and table filter.
 * The ld-table-search can be set to filter specific properties on objects in array. If no value is set any property
 * of the object is tested for match.
 * The ng-model is required to set.
 */
	.directive('ldTableSearch', ['$timeout', function ($timeout) {
		return {
			restrict: 'A',
			require: ['^ldTable', 'ngModel'],
			scope: {
				predicate: '=?ldTableSearch', // the property to filter
				model: '=ngModel'             // the value to look for
			},
			link: function (scope, element, attrs, controllers) {
				var tableController = controllers[0];
				var promise;

				// watch the predicate value so we can change filter at runtime
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
					}, 200);
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

				var criterion = attrs.ldTableSort;
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
						tableController.setOrderByFilter(criterion, (order === ORDER.DESCENT));
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
					if (angular.isUndefined(newValue) || angular.isUndefined(newValue.criterion) || newValue.criterion !== criterion) {
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
							tableController.setSearchFilter(newValue.filters);
						}
					}
				}, true);

			}
		};
	}])
/**
 * Setup pagination rowsPerPage for the ld-table, otherwise no pagination is used
 */
	.directive('ldTablePageRows', ['$parse', function ($parse) {
		return {
			restrict: 'A',
			require: '^ldTable',
			link: function (scope, element, attrs, tableController) {
				var rowsPerPageGetter = $parse(attrs.ldTablePageRows);

				// watch if the value is changed
				scope.$watch(rowsPerPageGetter, function (newValue) {
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
					if (tableController.getCurrentPage() !== page) {
						tableController.setPage(page);
					}
				}

				// watch for the current page value, so we can set it in the table
				// it's update by the angular-ui pagination directive
				scope.$watch('currentPage', function (newValue, oldValue) {
					if (newValue !== oldValue) {
						setCurrentPage(newValue);
					}
				});

				scope.$on(tableController.TABLE_UPDATED, function () {
					scope.totalItems = tableController.getFilteredRows();
					scope.itemsPerPage = tableController.getRowsPerPage();

					setCurrentPage(tableController.getCurrentPage());
				});
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
	.directive('ldTableInfo', ['ldTableInfoConfig', function (config) {
		return {
			restrict: 'EA',
			require: '^ldTable',
			templateUrl: 'partials/ldtableinfo.html',
			scope: {
				text: '@'
			},
			link: function (scope, element, attrs, tableController) {

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

				scope.$watch('text', function (value) {
					infoText = value;
					update();
				});

				scope.$on(tableController.TABLE_UPDATED, function () {
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
			link: function (scope, element, attrs, tableController) {
				scope.disablePreviousButtonClass = '';
				scope.disableNextButtonClass = '';

				scope.showPreviousButton = scope.showPreviousButton || config.showPreviousButtonDefault;
				scope.showNextButton = scope.showNextButton || config.showNextButtonDefault;

				function updateNavigation() {
					var page = tableController.getCurrentPage();
					scope.disablePreviousButtonClass = (page <= 1 ? 'disabled' : '');
					scope.disableNextButtonClass = (page >= tableController.getTotalPages() ? 'disabled' : '');
				}

				scope.$on(tableController.TABLE_UPDATED, function () {
					updateNavigation();
				});

				scope.previousPage = function () {
					tableController.setPage(tableController.getCurrentPage() - 1);
				};

				scope.nextPage = function () {
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
			link: function (scope, element, attrs, tableController) {
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

				function updateStyles() {
					var totalPages = tableController.getTotalPages();
					var currentPage = tableController.getCurrentPage();
					scope.firstPageClass = (totalPages > 1 && currentPage > 1) ? '' : 'disabled';
					scope.lastPageClass = (totalPages > 1 && currentPage < totalPages) ? '' : 'disabled';
					scope.previousPageClass = (currentPage > 1) ? '' : 'disabled';
					scope.nextPageClass = (currentPage < totalPages) ? '' : 'disabled';
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

				scope.gotoPage = function (page) {
					if (tableController.getCurrentPage() !== page) {
						tableController.setPage(page);
					}
				};

				scope.$on(tableController.TABLE_UPDATED, function () {
					scope.totalPages = tableController.getTotalPages();
					scope.currentPage = tableController.getCurrentPage();
					updateStyles();
					makePages();
				});
			}
		};
	}]);
