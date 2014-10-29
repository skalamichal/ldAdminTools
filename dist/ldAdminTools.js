; (function(angular){
'use strict';
angular.module('ldAdminTools', ['ui.bootstrap', 'RecursionHelper', 'LocalStorageModule']); 
'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldThreeStateCheckbox
 * @description
 * # ldThreeStateCheckbox
 */
angular.module('ldAdminTools')
	.directive('ldCheckbox', function () {
		return {
			template: '<input type="checkbox" ng-change="onChanged()" ng-model="checked">',
			restrict: 'E',
			scope: {
				checked: '=?',
				indeterminate: '=?',
				onchanged: '&?'
			},
			link: function postLink(scope, element) {
				scope.onChanged = function () {
					if (scope.indeterminate) {
						scope.indeterminate = false;
						scope.checked = false;
					}
					scope.onchanged()(scope.checked);
				};

				scope.$watch('indeterminate', function (value) {
					value = !!value;
					element.find('input').prop('indeterminate', value);
				});
			}
		};
	});

'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldFilterDropdown
 * @description
 * # ldFilterDropdown
 * filters is array with objects with following data:
 * - name {String}- the filter name
 * - filters {Object} optional - with predicate: value pairs
 * - clear {Array} optional - predicates as values, if defined and empty clear the filter
 * - divider {Boolean} - if true, the item is a divider in dropdown
 */
angular.module('ldAdminTools')
	.directive('ldFilterDropdown', [function () {
	return {
		restrict: 'EA',
		scope: {
			selectedFilter: '=',
			filters: '='
		},
		templateUrl: 'partials/ldfilterdropdown.html',
		link: function (scope, element) {
			scope.isEmpty = false;

			scope.selectFilter = function (filter) {
				scope.selectedFilter = filter;
			};

			if (angular.isDefined(scope.filters) && scope.filters.length > 0) {
				scope.selectFilter(scope.filters[0]);
			}
		}
	};
}]);


'use strict';

/**
 * @ngdoc directive
 * @name directive:ldMenu
 * @description
 * # sidebar menu directive
 */
angular.module('ldAdminTools')
	/*jshint unused:false*/
/**
 * The controller for the main ld-sidebar-menu directive for the sidebar menu.
 */
	.controller('ldSidebarMenuController', ['$scope', '$parse', '$attrs', function ($scope, $parse, $attrs) {
		var self = this;
		var menus = [];

		// register menu block
		this.registerMenu = function (menu) {
			var level = menu.level;
			if (angular.isUndefined(menus[level])) {
				menus[level] = [];
			}
			menus[level].push(menu);

			// setup the menu level style
			menu.menuLevelStyle = 'nav-' + self.getLevelAsString(level) + '-level';
		};

		// open menu function, goes through all menus at the same level and calls its closeMenu function on the scope
		this.openMenu = function(menu) {
			angular.forEach(menus[menu.level], function(m) {
				if (m.$id !== menu.$id) {
					m.closeMenu();
				}
			}, this);

			closeAllSubmenus(menu.level);
		};

		// close all submenus
		function closeAllSubmenus(level) {
			angular.forEach(menus, function(menu, index) {
				if (index > level) {
					angular.forEach(menu, function (m) {
						m.closeMenu();
					});
				}
			});
		}

		/**
		 * Return level as string, example "1" -> "first"
		 * @param level - max 3
		 */
		this.getLevelAsString = function (level) {
			if (level === 1) {
				return 'first';
			}
			else if (level === 2) {
				return 'second';
			}
			else if (level === 3) {
				return 'third';
			}

			return '';
		};

	}])
/**
 * The main directive, which wraps the menu functionality.
 */
	.directive('ldSidebarMenu', [function () {
		return {
			restrict: 'E',
			scope: {
				'data': '=',
				'options': '=?ldMenuOptions',
				'level': '=?level'
			},
			replace: true,
			// expose the sidebar menu controller API
			controller: 'ldSidebarMenuController',
			templateUrl: 'partials/ldmenu-wrap.html',
			/*jshint unused:false*/
			link: function (scope, element, attrs, controller) {
				// set the menu level
				scope.level = scope.level || 1;
				// get the style for the level: nav-first-level for example
				scope.menuLevelStyle = 'nav-' + controller.getLevelAsString(scope.level) + '-level';
			}
		};
	}])
/**
 * The ld-menu directive is used to wrap menu items.
 */
	.directive('ldMenu', ['RecursionHelper', function (recursionHelper) {
		return {
			restrict: 'E',
			scope: {
				'data': '=',
				'level': '='
			},
			// require the ld-sidebar-menu directive - each menu is registered to the top sidebar controller
			// require the ld-submenu-item directive, which is optional for submenu.
			require: ['^ldSidebarMenu', '?^ldSubmenuItem'],
			replace: true,
			templateUrl: 'partials/ldmenu-wrap.html',
			compile: function (element) {
				return recursionHelper.compile(element, function (scope, element, attrs, controllers) {
					var sidebarController = controllers[0];
					var submenuItemController = controllers[1];

					// register the menu for parent controllers
					sidebarController.registerMenu(scope);
					if (angular.isDefined(submenuItemController)) {
						submenuItemController.registerMenu(scope);
					}

					// define close menu at the scope, called from ld-sidebar-menu controller
					scope.closeMenu = function() {
						if (angular.isDefined(submenuItemController)) {
							submenuItemController.closeMenu();
						}
					};
				});
			}
		};
	}])
/**
 * The ld-menu-item is the simple menu item element
 */
	.directive('ldMenuItem', [function () {
		return {
			restrict: 'E',
			scope: {
				item: '=data'
			},
			templateUrl: 'partials/ldmenuitem.html',
			replace: true
		};
	}])
/**
 * The ld-submenu-item is item with submenu functionality
 * Defines several functions to handle submenu close/expand state and also via parent ld-sidebar-menu closes other menus
 * when current submenu is expanded
 */
	.directive('ldSubmenuItem', [function () {
		return {
			restrict: 'E',
			scope: {
				item: '=data',
				level: '='
			},
			controller: ['$scope', function($scope) {
				this.registerMenu = function(menu) {
					$scope.menu = menu;
				};

				this.closeMenu = function() {
					if (!$scope.collapsed) {
						$scope.collapsed = true;
					}
				};

			}],
			require: '^ldSidebarMenu',
			templateUrl: 'partials/ldsubmenuitem.html',
			replace: true,
			link: function(scope, element, attrs, controller) {
				scope.collapsed = true;

				scope.toggle = function() {
					scope.collapsed = !scope.collapsed;
					if (!scope.collapsed && angular.isDefined(scope.menu)) {
						controller.openMenu(scope.menu);
					}
				};

				scope.collapsedClass = function() {
					return scope.collapsed ? 'fa-angle-left' : 'fa-angle-down';
				};

				scope.isCollapsed = function() {
					return scope.collapsed;
				};
			}
		};
	}]);
'use strict';

/**
 * @ngdoc directive
 * @name directive:ldResize
 * @description
 * # resize directive to handle window resize
 * @param onResize - method called when window is resized
 */

angular.module('ldAdminTools')
.directive('ldResize', ['$window', function ($window) {
	return {
		restrict: 'EA',
		scope: {
			'ldOnResize': '&'
		},
		link: function (scope) {
			// wrap the $window to angular jqLite element
			var w = angular.element($window);

			// method to be called when window is resized
			var resizeMethod = scope.ldOnResize();

			// initialize the "current" size object
			scope.size = {
				width: -1,
				height: -1
			};

			// update the size with the current window size
			scope.updateSize = function () {
				scope.size.width = ($window.innerWidth > 0) ? $window.innerWidth : this.screen.width;
				scope.size.height = ($window.innerHeight > 0) ? $window.innerHeight : this.screen.height;
			};

			// watch for the size changes
			scope.$watchCollection('size', function (newValue) {
				// call the ldOnResize method
				resizeMethod(newValue.width, newValue.height);
			});

			// bind to the window onResize event
			w.bind('resize', function () {
				// execute the updateSize withing in angular framework
				scope.$apply(function () {
					scope.updateSize();
				});
			});

			// initialize
			scope.updateSize();
		}
	};
}]);
'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldSlideLeft
 * @description
 * Directive which allows the DOM element to slide to the left and hide the element.
 * Usage:
 * <div ld-slide-left="boolean value"></div>
 * Options:
 * ld-slide-left - boolean - shows the element
 * ld-animated - boolean - turns on/off the animation
 * ld-closeable - boolean - allows to hide the element
 */
angular.module('ldAdminTools')
	.constant('ldSlideLeftConfig', {
		// slide animation is by default on
		isAnimated: true,
		// the element is by default not closeable
		isCloseable: false
	})
	.controller('ldSlideLeftController', ['$scope', '$transition', '$attrs', '$parse', 'ldSlideLeftConfig', function ($scope, $transition, $attrs, $parse, config) {
		var self = this;
		var scope = $scope.$new();
		var currentTransition;

		// getter and setter for the ldAnimated value
		var getIsAnimated;
		var setIsAnimated = angular.noop;

		// getter and setter for the ldSlideLeft value, which has the open/close state
		var getIsOpen = $parse($attrs.ldSlideLeft);
		var setIsOpen = getIsOpen.assign;

		// getter and setter for the ldCloseable value
		var getIsCloseable;
		var setIsCloseable = angular.noop;

		// default properties
		var width = 0;
		var initialAnimSkip = true;

		// these properties may be defined in the directive, check if they are defined and get the value from them
		// or use the config value
		scope.isAnimated = angular.isDefined($attrs.ldAnimated) ? $scope.$eval($attrs.ldAnimated) : config.isAnimated;
		scope.isCloseable = angular.isDefined($attrs.ldCloseable) ? $scope.$eval($attrs.ldCloseable) : config.isCloseable;
		scope.isOpen = $scope.$eval($attrs.ldSlideLeft);

		// initialize the controller with element for sliding
		this.init = function (element) {
			self.$element = element;
			width = self.$element[0].offsetWidth;

			// check if ld-isAnimated is set and set watcher function to handle changes
			if (angular.isDefined($attrs.ldAnimated)) {
				getIsAnimated = $parse($attrs.ldAnimated);
				setIsAnimated = getIsAnimated.assign;

				// watch the attribute in the parent scope
				$scope.$watch(getIsAnimated, function (value) {
					// and update our scope variable so we can watch it's state
					scope.isAnimated = !!value;
				});
			}

			// check if ld-isCloseable is set and set watcher function to handle changes
			if (angular.isDefined($attrs.ldCloseable)) {
				getIsCloseable = $parse($attrs.ldCloseable);
				setIsCloseable = getIsCloseable.assign;

				// watch the attribute in the parent scope
				$scope.$watch(getIsCloseable, function(value) {
					// and update our scope variable so we can watch it's state
					scope.isCloseable = !!value;
				});
			}

			// the ld-slide-left is always set, because it's the directive name
			// watch the parent scope value
			$scope.$watch($attrs.ldSlideLeft, function (open) {
				// and update our scope variable so we can watch it's state
				scope.isOpen = !!open;
			});
		};

		// public controller API method
		this.toggle = function (open) {
			scope.isOpen = arguments.length ? !!open : !scope.isOpen;
			// update the parent scope as well
			setIsOpen($scope, scope.isOpen);
		};

		// perform the transition
		function doTransition(change) {
			function newTransitionDone() {
				// Make sure it's this transition, otherwise, leave it alone.
				if (currentTransition === newTransition) {
					currentTransition = undefined;
				}
			}

			var newTransition = $transition(self.$element, change);
			if (currentTransition) {
				currentTransition.cancel();
			}
			currentTransition = newTransition;
			newTransition.then(newTransitionDone, newTransitionDone);
			return newTransition;

		}

		// expand (show) the element
		this.expand = function () {
			if (!scope.isAnimated || initialAnimSkip) {
				initialAnimSkip = false;
				expandDone();
			}
			else {
				self.$element.removeClass('ld-slide').addClass('ld-sliding-left');
				doTransition({ left: 0 + 'px' }).then(expandDone);
			}
		};

		// transition is done
		function expandDone() {
			self.$element.css('left', '0px');
			self.$element.removeClass('ld-sliding-left');
			self.$element.addClass('ld-slide in');
		}

		// slide (close) the element
		this.slide = function () {
			if (initialAnimSkip || !scope.isAnimated) {
				initialAnimSkip = false;
				slideDone();
				self.$element.css({left: -width + 'px'});
			}
			else {
				// CSS transitions don't work with width: auto, so we have to manually change the height to a specific value
				self.$element.css({ left: 0 + 'px' });
				//trigger reflow so a browser realizes that height was updated from auto to a specific value
				/*jshint unused:false*/
				var x = self.$element[0].offsetLeft;

				self.$element.removeClass('ld-slide in').addClass('ld-sliding-left');

				doTransition({ left: -width + 'px' }).then(slideDone);
			}
		};

		// transition is done
		function slideDone() {
			self.$element.css('left', '-' + width + 'px');
			self.$element.removeClass('ld-sliding-left in');
			self.$element.addClass('ld-slide');
		}

		// update the element based on the isOpen state
		function update() {
			if (scope.isOpen) {
				self.expand();
			}
			else {
				self.slide();
			}
		}

		// watch for the isOpen scope variable changes
		scope.$watch('isOpen', function(shouldOpen) {
			// if not isCloseable and we should close, it's not allowed, switch back to isOpen true
			if (!scope.isCloseable && !shouldOpen) {
				scope.isOpen = true;
				setIsOpen($scope, scope.isOpen);
			}
			update();
		});

		// watch for the isCloseable scope variable changes
		scope.$watch('isCloseable', function(closeable) {
			if (!closeable && !scope.isOpen)
			{
				scope.isOpen = true;
				setIsOpen($scope, scope.isOpen);
			}
			update();

		});

	}])
	.directive('ldSlideLeft', [function () {
		return {
			restrict: 'A',
			// use the ldSlideLeftController defined above
			controller: 'ldSlideLeftController',
			link: function postLink(scope, element, attrs, controller) {
				// initialize the controller
				controller.init(element);
			}
		};
	}])
	.directive('ldSlideToggle', [function()
	{
		return {
			require: '?^ldSlideLeft',
			/*jshint unused:false*/
			link: function (scope, element, attrs, slideController) {
				if (!slideController) {
					return;
				}

				// toggle the element visibility (slide it)
				function toggleSlide() {
					scope.$apply(function() {
						slideController.toggle();
					});
				}

				element.on('click', toggleSlide);

				// remove the handler, when directive is removed
				scope.$on('$destroy', function () {
					element.off('click', toggleSlide);
				});
			}
		};
	}]);

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

		/**
		 * Makes copy of source array, which is used for filtering, ...
		 * @param src
		 * @returns {Array}
		 */
		function makeCopy(src) {
			filteredRows = totalRows = src.length;
			return [].concat(src);
		}

		/**
		 * We have a copy of the data, which is updated, so we don't affect the original collection
		 */
		var dataCopy = makeCopy(displayGetter($scope));
		var filtered = dataCopy;

		// table paging properties
		var currentPage = 1;
		var rowsPerPage = dataCopy.length;
		var totalPages = 1;

		// setup event handler
		$scope.$on(filterService.FILTER_UPDATED, angular.bind(this, function(event, filterId, filterObj)     {
			// call apply if the updated filter is the same as ours
			if (filterId === filter) {
				this.filterUpdated();
			}
		}));

		// if the filter is generated, don't store it and remove, when table is removed
		if (angular.isUndefined($attrs.ldFilter)) {
			$scope.$on('$destroy', function() {
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
					tableController.setPage(page);
				}

				// watch for the current page value, so we can set it in the table
				// it's update by the angular-ui pagination directive
				scope.$watch('currentPage', function (newValue, oldValue) {
					if (newValue !== oldValue) {
						setCurrentPage(newValue);
					}
				});

				scope.$on(tableController.TABLE_UPDATED, function() {
					scope.totalItems = tableController.getFilteredRows();
					scope.itemsPerPage = tableController.getRowsPerPage();

					setCurrentPage(1);
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

				scope.$on(tableController.TABLE_UPDATED, function() {
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

				scope.$on(tableController.TABLE_UPDATED, function() {
					updateNavigation();
				})

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
					tableController.setPage(page);
				};

				scope.$on(tableController.TABLE_UPDATED, function() {
					scope.totalPages = tableController.getTotalPages();
					scope.currentPage = tableController.getCurrentPage();
					updateStyles();
					makePages();
				});
			}
		};
	}]);

'use strict';

/**
 * @ngdoc service
 * @name ldAdminTools.ldFilterService
 * @description
 * # ldFilterService
 * Service in the ldAdminTools.
 *
 * The ldFilterService stores filters across different pages
 * Each filter is an object with following values:
 * - filters {Object} - values for the $filter('filter') filter, build in angular filter.
 * - orderBy {Array} - array of member used to sort the input array.
 * - ??custom - TODO
 */
angular.module('ldAdminTools')
	/*jshint unused:false*/
	.service('ldFilterService', ['$rootScope', '$filter', 'localStorageService', function ldFilterService($rootScope, $filter, localStorage) {

		// filters are stored in named array
		var filterFilter = $filter('filter');
		var orderByFilter = $filter('orderBy');

		// filters object, each filter is stored by it's name
		var filters = {};

		/**
		 * Apply the $filter('filter') filter
		 * @param data
		 * @param filter
		 * @returns {Array} - filtered or original array
		 */
		function applyFilterFilter(data, filter) {
			if (angular.isUndefined(filter)) {
				return data;
			}

			return filterFilter(data, filter);
		}

		/**
		 * Apply the $filter('orderBy') filter
		 * @param data
		 * @param orderBy
		 * @returns {Array} - filtered or original array
		 */
		function applyOrderByFilter(data, orderBy) {
			if (angular.isUndefined(orderBy)) {
				return data;
			}

			return orderByFilter(data, orderBy.criterion, orderBy.reverse);
		}

		return {

			FILTER_REMOVED: 'ldFilterRemoved',
			FILTER_UPDATED: 'ldFilterUpdated',

			/**
			 * Get the filter from stored filters or create new filter
			 * @param filterId
			 * @returns {*}
			 */
			getFilter: function (filterId) {
				if (angular.isUndefined(filters[filterId])) {
					filters[filterId] = {};
				}
				return filters[filterId];
			},

			/**
			 * Remove the stored filter
			 * @param filterId
			 */
			removeFilter: function (filterId) {
				delete filters[filterId];

				$rootScope.$broadcast(this.FILTER_REMOVED, filterId);
			},

			/**
			 * Apply the filter
			 * @param filterId - filter to apply
			 * @param input {Array}
			 * @returns {Array} - filtered array
			 */
			applyFilter: function (filterId, input) {
				if (!angular.isArray(input)) {
					return input;
				}

				var filter = this.getFilter(filterId);

				var data = input;

				data = applyFilterFilter(data, filter.filter);
				data = applyOrderByFilter(data, filter.orderBy);

				return data;
			},

			/**
			 * Ads search criterion to existing search criteria
			 * @param filterId
			 * @param criterion
			 */
			addFilterFilterCriterion: function (filterId, criterion) {
				var filter = this.getFilter(filterId);
				if (angular.isUndefined(filter.filter)) {
					filter.filter = {};
				}

				// if string, it a global search, change it to {$:criterion}
				if (angular.isString(criterion)) {
					angular.extend(filter.filter, {$: criterion});
				}
				// if is an object, just extend it
				else if (angular.isObject(criterion)) {
					angular.extend(filter.filter, criterion);
				}

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			removeFilterFilterCriterion: function (filterId, criterion) {
				var filter = this.getFilter(filterId);

				// nothing to remove in this case
				if (angular.isUndefined(filter.filter)) {
					return;
				}

				// string should represent one property, remove it
				if (angular.isString(criterion)) {
					delete filter.filter[criterion];
				}
				else if (angular.isArray(criterion)) {
					angular.forEach(criterion, function (key) {
						delete filter.filter[key];
					});
				}
				// loop through key,value pairs and remove them
				else if (angular.isObject(criterion)) {
					angular.forEach(criterion, function (value, key) {
						delete filter.filter[key];
					});
				}

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			clearFilterFilter: function (filterId) {
				var filter = this.getFilter(filterId);
				delete filter.filter;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			addOrderByFilterCriterion: function (filterId, criterion, reverse) {
				var filter = this.getFilter(filterId);
				var rev = !!reverse;

				if (angular.isUndefined(filter.orderBy)) {
					filter.orderBy = {};
				}

				if (angular.isString(criterion)) {
					filter.orderBy = {
						criterion: criterion,
						reverse: rev
					};
				}

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			removeOrderByFilterCriterion: function (filterId, criterion) {
				var filter = this.getFilter(filterId);

				if (angular.isUndefined(filter)) {
					return;
				}

				if (angular.isString(criterion)) {
					filter.orderBy = {};
				}

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			clearOrderByFilter: function (filterId) {
				var filter = this.getFilter(filterId);
				delete filter.orderBy;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			forceUpdate: function (filterId) {
				var filter = this.getFilter(filterId);
				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			forceUpdateAll: function () {
				angular.forEach(filters, function (filter, filterId) {
					$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
				}, this);
			},

			storeFilters: function () {
				if (localStorage.isSupported) {
					localStorage.set('filters', angular.toJson(filters));
				}
			},

			loadFilters: function () {
				if (localStorage.isSupported) {
					filters = angular.fromJson(localStorage.get('filters'));
				}

				if (angular.isDefined(filters) && filters === null) {
					filters = {};
				}

			}
		};
	}]);

angular.module('ldAdminTools').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('partials/ldfilterdropdown.html',
    "<div class=ld-filter-dropdown dropdown><a style=cursor:pointer dropdown-toggle role=button>{{ selectedFilter.name }} <i class=\"fa fa-caret-down\"></i></a><ul class=dropdown-menu><li ng-repeat=\"filter in filters\" ng-class=\"filter.divider ? 'divider' : ''\"><a ng-if=!filter.divider ng-click=selectFilter(filter);>{{ filter.name }}</a></li></ul></div>"
  );


  $templateCache.put('partials/ldmenu-wrap.html',
    "<ul class=nav ng-class=menuLevelStyle><li ng-repeat=\"item in data\"><ld-menu-item ng-if=!item.submenu data=item></ld-menu-item><ld-submenu-item ng-if=item.submenu data=item level=level></ld-submenu-item></li></ul>"
  );


  $templateCache.put('partials/ldmenuitem.html',
    "<a class=ld-menuitem ng-href={{item.url}} ld-slide-toggle><i ng-if=\"item.icon.length > 0\" class=\"fa fa-fw {{item.icon}}\"></i> {{ item.text }} <span class=badge ng-if=\"item.badge && item.badge() > 0\">{{ item.badge() }}</span></a>"
  );


  $templateCache.put('partials/ldsubmenuitem.html',
    "<div><a class=ld-menuitem ng-href={{item.url}} ng-click=toggle()><i ng-if=\"item.icon.length > 0\" class=\"fa fa-fw {{item.icon}}\"></i> {{ item.text }} <span class=badge ng-if=\"item.badge && item.badge() > 0\">{{ item.badge() }}</span> <span class=\"fa ld-right\" ng-class=collapsedClass()></span></a><ld-menu collapse=isCollapsed() data=item.submenu level=\"level + 1\"></ld-menu></div>"
  );


  $templateCache.put('partials/ldtableinfo.html',
    "<span class=ld-table-info>{{ infoText }}</span>"
  );


  $templateCache.put('partials/ldtablenavigation.html',
    "<div class=ld-table-navigation><a href=\"\" class=\"btn btn-link ld-table-navigation-btn\" ng-if=showPreviousButton ng-class=disablePreviousButtonClass ng-click=previousPage()><i class=\"fa fa-fw fa-chevron-left fa-lg\"></i></a> <a href=\"\" class=\"btn btn-link ld-table-navigation-btn\" ng-if=showNextButton ng-class=disableNextButtonClass ng-click=nextPage()><i class=\"fa fa-fw fa-chevron-right fa-lg\"></i></a></div>"
  );


  $templateCache.put('partials/ldtablenavigationdropdown.html',
    "<div class=ld-table-navigation-dropdown dropdown><a href=\"\" dropdown-toggle style=cursor:pointer role=button>{{ description }} {{ currentPage }} of {{ totalPages }} <i class=\"fa fa-fw fa-caret-down\"></i></a><ul class=\"dropdown-menu dropdown-menu-right\"><li class=dropdown-header>{{ header }}</li><li ng-class=firstPageClass><a href=\"\" ng-click=gotoPage(1)><i class=\"fa fa-fw fa-angle-double-left fa-lg\"></i>{{ firstPage }}</a></li><li ng-class=previousPageClass><a href=\"\" ng-click=\"gotoPage(currentPage - 1)\"><i class=\"fa fa-fw fa-angle-left fa-lg\"></i>{{ previousPage }}</a></li><li ng-repeat=\"page in pages\" ng-class=\"page.active ? 'divider' : ''\"><a href=\"\" ng-if=!page.active ng-click=gotoPage(page.page)><i class=\"fa fa-fw fa-lg\" ng-class=\"page.active ? 'fa-caret-right' : ''\"></i>{{ page.text }}</a></li><li ng-class=nextPageClass><a href=\"\" ng-click=\"gotoPage(currentPage + 1)\"><i class=\"fa fa-fw fa-angle-right fa-lg\"></i>{{ nextPage }}</a></li><li ng-class=lastPageClass><a href=\"\" ng-click=gotoPage(totalPages)><i class=\"fa fa-fw fa-angle-double-right fa-lg\"></i>{{ lastPage }}</a></li></ul></div>"
  );


  $templateCache.put('partials/ldtablepagination.html',
    "<div class=ld-table-pagination><pagination class=ld-pagination ng-show=\"__numPages > 1 && isVisible\" num-pages=__numPages ng-model=currentPage max-size=maxSize total-items=totalItems items-per-page=itemsPerPage boundary-links=true previous-text=&lsaquo; next-text=&rsaquo; first-text=&laquo; last-text=&raquo;></pagination></div>"
  );

}]);
})(angular);