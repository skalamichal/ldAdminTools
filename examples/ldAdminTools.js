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
					if (angular.isDefined(scope.onchanged)) {
						scope.onchanged()(scope.checked);
					}
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
 * @name ldAdminTools.directive:ldClickableRows
 * @description
 * # ldClickableRows
 * This directive is supposed to be used on tr elements and will enhance the enclosed
 * td elements with an ng-click directive. This is useful if you do not want to make
 * all columns clickable for some reason. Currently, it skips the columns containing
 * an input (checkbox, etc). Example usage: ld-clickable-rows="rowClicked(item)"
 * - this will result in ng-click="rowClicked(item)" being added to individual td
 * elements. It also adds ld-clickable css class to the TDs. By default, this class
 * sets the mouse cursor to "pointer".
 *
 * Optionally, you can also specify the ld-clickable-rows-active attribute to apply an
 * additional css class to the TDs besides ld-clickable. This is useful for displaying
 * "unread" items in an inbox-like list. Example usage:
 * ld-clickable-rows-active="{'ld-unread': !msg.read}"
 */
angular.module('ldAdminTools')
	.directive('ldClickableRows', ['$compile', function ($compile) {
		function link(scope, element, attrs) {
			angular.forEach(element.find('td'), function(value) {
				// avoid columns with input elements (such as checkboxes)
				// update all the others with a custom css class and an ng-click
				var tdElement = angular.element(value);
				if(tdElement.find('input').length === 0) {
					tdElement.addClass('ld-clickable').attr('ng-click', attrs.ldClickableRows);

					if(angular.isDefined(attrs.ldClickableRowsActive)) {
						tdElement.attr('ng-class', attrs.ldClickableRowsActive);
					}

					$compile(tdElement)(scope);
				}
			});
		}
		return {
			restrict: 'A',
			link: link
		};
	}]);

'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldDashboardBox
 * @description
 * # ldDashboardBox
 *
 * panelType may be one of following:
 * - default - gray
 * - primary - blue
 * - success - green
 * - info - light blue
 * - warning - orange
 * - danger - red
 */
angular.module('ldAdminTools')
	.constant('ldDashboardBoxConfig', {
		panelTypeDefault: 'default'
	})
	.directive('ldDashboardBox', ['ldDashboardBoxConfig', function (config) {
		return {
			templateUrl: 'partials/lddashboardbox.html',
			restrict: 'E',
			transclude: true,
			replace: true,
			scope: {
				ldIsOpen: '=?',
				ldTitle: '@',
				ldType: '@',
				ldSize: '@?',
				ldOnClose: '&?',
				ldOnToggle: '&?'
			},
			link: function postLink(scope, element, attrs, dbboxController) {
				scope.panelType = scope.ldType || config.panelTypeDefault;
				scope.isOpen = angular.isDefined(scope.ldIsOpen) ? !!scope.ldIsOpen : true;

				scope.close = function() {
					if (angular.isDefined(scope.ldOnClose())) {
						scope.ldOnClose()();
					}

					element.remove();
				};

				scope.toggle = function() {
					scope.ldIsOpen = scope.isOpen = !scope.isOpen;

					if (angular.isDefined(scope.ldOnToggle())) {
						scope.ldOnToggle()(scope.isOpen);
					}
				};
			}
		};
	}]);
'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldDashboardBoxGroup
 * @description
 * # ldDashboardBoxGroup
 */
angular.module('ldAdminTools')
	.directive('ldDashboardBoxGroup', function () {
		return {
			templateUrl: 'partials/lddashboardboxgroup.html',
			restrict: 'E',
			transclude: true,
			replace: true,
			link: function postLink(scope, element, attrs) {
			}
		};
	});
'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldDataNavigation
 * @description
 * # ldDataNavigation
 * Allows navigation between views by id, which is send in an array of view ids and current id. Optional is the filter send
 * which is then displayed as 'filter name': index of total
 * The view-url is a url string with the format 'url {0}' where the {0} is replaced with the view id.
 */
angular.module('ldAdminTools')
	.constant('ldDataNavigationConfig', {
		messageDefault: '{0} of {1}',   // the page of pages message, where the {0} is replaced by current page number and
										// {1} with the total pages
		showPreviousButtonDefault: true,
		showNextButtonDefault: true
	})
	.directive('ldDataNavigation', ['$location', 'ldDataNavigationConfig', function ($location, config) {
		return {
			templateUrl: 'partials/lddatanavigation.html',
			restrict: 'E',
			scope: {
				data: '=', // array with ids
				viewUrl: '@',
				currentId: '=',
				filter: '@?'
			},
			link: function postLink(scope) {
				var message = scope.message || config.messageDefault;

				scope.disablePreviousButtonClass = '';
				scope.disableNextButtonClass = '';

				scope.showPreviousButton = scope.showPreviousButton || config.showPreviousButtonDefault;
				scope.showNextButton = scope.showNextButton || config.showNextButtonDefault;

				scope.currentIndex = scope.data.indexOf(scope.currentId);

				function updateNavigation() {
					scope.disablePreviousButtonClass = (scope.currentIndex <= 0 ? 'disabled' : '');
					scope.disableNextButtonClass = (scope.currentIndex >= scope.data.length - 1 ? 'disabled' : '');

					var msg = message.replace('{0}', scope.currentIndex + 1);
					msg = msg.replace('{1}', scope.data.length);
					scope.message = msg;
				}

				scope.previousEntry = function () {
					scope.index = scope.currentIndex - 1;
				};

				scope.nextEntry = function () {
					scope.index = scope.currentIndex + 1;
				};

				scope.$watch('index', function(newIndex) {
					if (angular.isUndefined(newIndex)) {
						return;
					}
					var path = scope.viewUrl.replace('{0}', scope.data[newIndex]);
					$location.url(path);
				});

				updateNavigation();
			}
		};
	}]);

'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldFilterDropdown
 * @description
 * # ldFilterDropdown
 * list is array with objects with following must have data:
 * - name {String}- the item name displayed in the dropdown
 * - divider, when item is an divider not a real item to select
 *
 * When item is selected, the onchanged function is called and the selected variable is updated.
 */
angular.module('ldAdminTools')
	.directive('ldDropdown', [function () {
	return {
		restrict: 'EA',
		scope: {
			selected: '=?',
			list: '=',
			onchanged: '&?'
		},
		templateUrl: 'partials/lddropdown.html',
		link: function (scope) {
			scope.select = function (item) {
				scope.selected = item;

				if (angular.isDefined(scope.onchanged)) {
					scope.onchanged()(item);
				}
			};

			if (angular.isUndefined(scope.selected) && angular.isDefined(scope.list) && scope.list.length > 0) {
				scope.select(scope.list[0]);
			}
		}
	};
}]);


'use strict';

/**
 * @ngdoc directive
 * @name ldAdminToolsApp.directive:ldExpandableInput
 * @description
 * # ldExpandableInput
 */
angular.module('ldAdminTools')
	.constant('ldExpandableInputConfig', {
		placeholderDefault: 'Enter value...',
		closeTextDefault: 'Close',
		openIconDefault: 'fa-toggle-on',
		closeIconDefault: 'fa-toggle-off',
		clearIconDefault: 'fa-remove',
		closeOnToggleDefault: false
	})
	.directive('ldExpandableInput', ['$parse', '$timeout', 'ldExpandableInputConfig', function ($parse, $timeout, config) {
		return {
			templateUrl: 'partials/ldexpandableinput.html',
			restrict: 'E',
			require: '^ngModel',
			scope: {
				model: '=ngModel',
				placeholder: '@?',
				closeText: '@',
				opened: '=?',
				openIcon: '@',
				closeIcon: '@',
				clearIcon: '@',
				onClear: '&?',
				onOpen: '&?',
				onClose: '&?'
			},
			link: function postLink(scope) {

				function setIconLeft() {
					if (scope.isOpened) {
						return angular.isUndefined(scope.closeIcon) ? config.closeIconDefault : scope.closeIcon;
					}
					else {
						return angular.isUndefined(scope.openIcon) ? config.openIconDefault : scope.openIcon;
					}
				}

				function updateIcons() {
					scope.iconLeft = setIconLeft();
					scope.iconRight = angular.isUndefined(scope.clearIcon) ? config.clearIconDefault : scope.clearIcon;
				}

				scope.isOpened = !!scope.opened;
				scope.inputValue = scope.model;
				scope.isFocus = false;

				scope.$watch('placeholder', function (newValue) {
					scope.placeholder = angular.isUndefined(newValue) ? config.placeholderDefault : newValue;
				});

				scope.$watch('closeText', function (newValue) {
					scope.closeText = angular.isDefined(newValue) ? newValue : config.closeTextDefault;
				});

				scope.$watch('inputValue', function (newValue) {
					scope.model = newValue;
				});

				scope.$watch('model', function (newValue) {
					scope.inputValue = newValue;
				});

				scope.$watch('isOpened', function (newValue) {
					scope.opened = !!newValue;
					scope.isFocus = scope.opened;
					updateIcons();
				});

				scope.$watch('opened', function (newValue) {
					scope.isOpened = !!newValue;
					scope.isFocus = scope.isOpened;
					updateIcons();
				});

				scope.clear = function () {
					scope.inputValue = '';
					scope.isFocus = true;

					if (angular.isFunction(scope.onClear())) {
						scope.onClear()();
					}
				};

				scope.open = function () {
					scope.isOpened = true;

					if (angular.isFunction(scope.onOpen())) {
						scope.onOpen()();
					}
				};

				scope.close = function () {
					scope.isOpened = false;

					scope.clear();

					if (angular.isFunction(scope.onClose())) {
						scope.onClose()();
					}
				};

				// init
				updateIcons();
			}
		};
	}]);

'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldInputFocus
 * @description
 * # ldInputFocus
 */
angular.module('ldAdminTools')
	.directive('ldInputFocus', ['$parse', '$timeout', function ($parse, $timeout) {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs) {
				var property = attrs.ldInputFocus;
				var isFocus = $parse(property);
				scope.$watch(isFocus, function (newValue) {
					if (!!newValue) {
						$timeout(function() {
							element[0].focus();
						});
					}
				});
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
 * The ld-resize parametes is a method to be called when window is resized
 */

angular.module('ldAdminTools')
	.directive('ldResize', ['$window', '$parse', function ($window, $parse) {
		return {
			restrict: 'EA',
			link: function (scope, element, attrs) {
				// wrap the $window to angular jqLite element
				var w = angular.element($window);

				// method to be called when window is resized
				var resizeMethodGetter = $parse(attrs.ldResize);
				var resizeMethod = resizeMethodGetter(scope);

				if (angular.isUndefined(resizeMethod)) {
					return;
				}

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

			// setup the watcher
			// TODO could cause issue with large data, consider to watch only display data
			// TODO remove deep object watch and add data length changes
			$scope.$watch(function () {
				return sourceGetter($scope);
			}, function (newData, oldData) {
				if (newData !== oldData) {
					updateTableSource(newData);
				}
			}, true);
		}
		// if no source is defined, watch changes in display data
		else {
			dataCopy = makeCopy(displayGetter($scope));
			// TODO watch
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

'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTableCheckbox
 * @description
 * # ldTableCheckbox
 * ldTableCheckbox allows to place the select all/none checkbox to the table, which will mark all currently displayed
 * items in the table as selected or not selected.
 */
angular.module('ldAdminTools')
	.directive('ldTableCheckbox', function () {
		return {
			template: '<ld-checkbox onchanged="updateSelection" indeterminate="isIndeterminate" checked="isChecked"></ld-checkbox>',
			require: '^ldTable',
			scope: true,
			restrict: 'E',
			link: function postLink(scope, element, attrs, tableController) {

				function getSelectedItemsCount(data) {
					var count = 0;
					angular.forEach(data, function (item) {
						if (item.selected) {
							count++;
						}
					});
					return count;
				}

				scope.updateSelection = function updateSelection(select) {
					if (select) {
						selectAll();
					}
					else {
						selectNone();
					}
				};

				function selectAll() {
					angular.forEach(tableController.getRows(), function (row) {
						row.selected = true;
					});
				};

				function selectNone () {
					angular.forEach(tableController.getRows(), function (row) {
						row.selected = false;
					});
				};

				scope.$on(tableController.TABLE_UPDATED, function() {
					var dataRows = tableController.getRows();
					var selectedItems = getSelectedItemsCount(dataRows);
					scope.isIndeterminate = (selectedItems > 0 && selectedItems < dataRows.length);
					scope.isChecked = (dataRows.length > 0 && selectedItems === dataRows.length);
				});
			}
		};
	});

'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTableInfo
 * @description
 * # ldTableInfo
 * Simple directive which allows to display the range of displayed items. Allows to set the description.
 * Example: 1-20 of 95 Messages
 */
angular.module('ldAdminTools')
	.constant('ldTableInfoConfig', {
		textDefault: '{0} - {1} of {2} Items'
	})
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
					scope.isVisible = rows > 0;
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
	}]);
'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTableNavigation
 * @description
 * # ldTableNavigation
 * Simple navigation directive, which displays previous and next button
 */
angular.module('ldAdminTools')
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

				// update first
				updateNavigation();
			}
		};
	}]);
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

				function updateStyles() {
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

				function update() {
					scope.totalPages = tableController.getTotalPages();
					scope.currentPage = tableController.getCurrentPage();
					updateStyles();
					makePages();
				}

				scope.gotoPage = function (page) {
					if (tableController.getCurrentPage() !== page) {
						tableController.setPage(page);
					}
				};

				scope.$on(tableController.TABLE_UPDATED, function () {
					update();
				});

				// update first
				update();

			}
		};
	}]);
'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTablePageRows
 * @description
 * # ldTablePageRows
 * Setup pagination rowsPerPage for the ld-table, otherwise no pagination is used
 */
angular.module('ldAdminTools')
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
	}]);
'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTablePagination
 * @description
 * # ldTablePagination
 * The ld-table-pagination is a plugin to paginate the table. Following values could be set via attributes:
 * - items-per-page {Number} - the max number of rows displayed on the page
 * - max-size {Number} - max number of buttons in paginntion
 * - is-visible {Boolean} - show/hide the pagination
 */
angular.module('ldAdminTools')
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
	}]);
'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTableSearch
 * @description
 * # ldTableSearch
 * The ld-table-search makes a binding between input field and table filter.
 * The ld-table-search can be set to filter specific properties on objects in array. If no value is set any property
 * of the object is tested for match.
 * The ng-model is required to set.

 */
angular.module('ldAdminTools')
	.directive('ldTableSearch', ['$timeout', '$parse', function ($timeout, $parse) {
		return {
			restrict: 'A',
			require: ['^ldTable', 'ngModel'],
			link: function (scope, element, attrs, controllers) {
				var tableController = controllers[0];
				var modelController = controllers[1];
				var promise;

				var predicateGet = $parse(attrs.ldTableSearch);
				var predicate;

				// watch the predicate value so we can change filter at runtime
				scope.$watch(predicateGet, function (newValue, oldValue) {
					if (newValue !== oldValue) {
						predicate = newValue;
						tableController.removeSearchFilter(oldValue);
						tableController.setSearchFilter(modelController.$viewValue || '', predicate);
					}
				});

				// method called when the content of ng-model is changed
				// it's using the $timeout service, so we don't update the filter at every change
				function inputChanged() {
					if (promise !== null) {
						$timeout.cancel(promise);
					}

					promise = $timeout(function () {
						tableController.setSearchFilter(modelController.$viewValue || '', predicate);
						promise = null;
					}, 200);
				}

				scope.$on(tableController.TABLE_UPDATED, function() {
					var filter = tableController.getSearchFilters();
					console.log(filter);
				});

				// watch for the input changes
				scope.$watch(function() {
					return modelController.$viewValue
				}, inputChanged);
			}
		};
	}])
'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTableSort
 * @description
 * # ldTableSort
 * The ld-table-sort makes a binding between element and table column sorting. The value defines the
 * order by predicate.
 * Optionally you can use the ld-table-sort-default attribute with no value as a default ascent sorting or "reverse"
 * value for descent sorting.
 */
angular.module('ldAdminTools')
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

				scope.$on(tableController.TABLE_UPDATED, function () {
					var orderBy = tableController.getOrderByFilters();
					if (angular.isUndefined(orderBy) || angular.isUndefined(orderBy.criterion) || orderBy.criterion !== criterion) {
						order = ORDER.NONE;
					}
					else {
						if (criterion === orderBy.criterion) {
							if (orderBy.reverse) {
								order = ORDER.DESCENT;
							}
							else {
								order = ORDER.ASCENT;
							}
						}
					}

					updateStyle();
				});

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
'use strict';

/**
 * @ngdoc filter
 * @name ldAdminTools.filter:ldPading
 * @function
 * @description
 * # ldPading
 * Filter in the ldAdminTools.
 * The ld-paging filters selects items from array based in paging (page number and page rows)
 */
angular.module('ldAdminTools')
	.filter('ldPaging', function () {
		return function (data, page, rowsPerPage) {
			if (!angular.isArray(data)) {
				return data;
			}

			var fromRow = (page - 1) * rowsPerPage;
			var toRow = fromRow + rowsPerPage;
			return data.slice(fromRow, toRow);
		};
	});

'use strict';

/**
 * @ngdoc filter
 * @name ldAdminToolsApp.filter:ldSelect
 * @function
 * @description
 * # ldSelect
 * Filter in the ldAdminToolsApp.
 * Selects data from collection based on select options data (in this order):
 * {
 *  where: {
 *      field: value
 *  },
 *  order: 'field' or ['+field', '-field', ...],
 *  from: index
 *  limit: number,
 *  values: ['field', ...]
 * }
 *
 * If values are defined the new array has full copy of the input collection, but a new field named '$' is added with
 * filtered values. This allows to use the filter with ng-repeat for eaxmple.
 */
angular.module('ldAdminTools')
	.filter('ldSelect', ['$filter', function ($filter) {

		/**
		 * Return new object with properties defined in the values array
		 * @param {Object} obj
		 * @param {Array} values
		 * @returns {{}}
		 */
		function selectValues(obj, values) {
			obj.$ = {};
			angular.forEach(values, function (key) {
				obj.$[key] = obj[key];
			});

			return obj;
		}

		/**
		 * Create new objects array where only defined values are selected.
		 * @param {Array} input
		 * @param {Array} vals
		 * @returns {*}
		 */
		function values(input, vals) {
			if (angular.isUndefined(vals)) {
				return input;
			}

			var out = [];

			angular.forEach(input, function (row) {
				if (angular.isObject(row)) {
					out.push(selectValues(row, vals));
				}
			});

			return out;
		}

		/**
		 * Return filtered array
		 * @param input
		 * @param whre
		 * @returns {*}
		 */
		function where(input, whre) {
			if (angular.isUndefined(whre)) {
				return input;
			}

			var filter = $filter('filter');
			return filter(input, whre);
		}

		/**
		 * Return ordered array.
		 * @param input
		 * @param orderBy
		 * @returns {*}
		 */
		function order(input, orderBy) {
			if (angular.isUndefined(order)) {
				return input;
			}

			var filter = $filter('orderBy');
			return filter(input, orderBy);
		}

		/**
		 * Return limitTo from array
		 * @param input
		 * @param lmit
		 */
		function limit(input, lmit) {
			if (angular.isUndefined(lmit)) {
				return input;
			}

			var filter = $filter('limitTo');
			return filter(input, lmit);
		}

		/**
		 * Return ldFrom from array
		 * @param input
		 * @param fromIndex
		 * @returns {*}
		 */
		function from(input, fromIndex) {
			if (angular.isUndefined(fromIndex)) {
				return input;
			}

			var filter = $filter('ldFrom');
			return filter(input, fromIndex);
		}

		return function (input, options) {
			if (!angular.isArray(input)) {
				return input;
			}

			var copy = where(input, options.where);
			copy = order(copy, options.order);
			copy = from(copy, options.from);
			copy = limit(copy, options.limit);
			copy = values(copy, options.values);

			return copy;
		};
	}]);

'use strict';

/**
 * @ngdoc filter
 * @name ldAdminTools.filter:lfFrom
 * @function
 * @description
 * # lfFrom
 * Filter in the ldAdminTools.
 *
 * Returns data from index.
 */
angular.module('ldAdminTools')
	.filter('lfFrom', function () {
		return function (input, fromIndex) {
			if (!angular.isArray(input)) {
				return input;
			}

			var fromIdx = fromIndex || 0;

			return input.slice(fromIdx);
		};
	});

'use strict';

/**
 * @ngdoc service
 * @name ldAdminToolsApp.ldCache
 * @description
 * # ldCache
 * Service in the ldAdminToolsApp.
 * Simple cache service
 */
angular.module('ldAdminTools')
	.constant('ldCacheConfig', {
		limit: 10,
		useLocalStorage: true,
		prefix: 'ldCache_'
	})
	.service('ldCache', ['ldCacheConfig', 'localStorageService', function ldCache(config, localStorage) {
		// cache storage
		var cached = {};

		// the prefix for local storage keys
		var prefix = config.prefix;

		/**
		 * Read entry from local storage by the key
		 * @param key
		 * @returns {*}
		 */
		function readFromLocalStorage(key) {
			if (localStorage.isSupported) {
				return localStorage.get(prefix + key);
			}
		}

		/**
		 * Remove entry from the local storage
		 * @param key
		 */
		function removeFromLocalStorage(key) {
			if (localStorage.isSupported) {
				localStorage.remove(prefix + key);
			}
		}

		/**
		 * Write entry to the local storage.
		 * @param key
		 * @param data
		 */
		function writeToLocalStorage(key, data) {
			if (localStorage.isSupported) {
				localStorage.set(prefix + key, data);
			}
		}

		/**
		 * Clear all cached entries from the local storage
		 */
		function removeAllFromLocalStorage() {
			if (localStorage.isSupported) {
				var keys = localStorage.keys();
				angular.forEach(keys, function (key) {
					if (key.indexOf(prefix) !== -1) {
						localStorage.remove(key);
					}
				});
			}
		}

		this.cache = function (key, data) {
			cached[key] = data;
			writeToLocalStorage(key, data);
		};

		this.get = function (key) {
			if (angular.isUndefined(cached[key])) {
				// look in localStorage
				cached[key] = readFromLocalStorage(key);
			}
			return cached[key];
		};

		this.clear = function (key) {
			if (angular.isDefined(key) && angular.isDefined(cached[key])) {
				delete cached[key];
				removeFromLocalStorage(key);
			}
			// clear all
			else {
				removeAllFromLocalStorage();
				cached = {};
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
 * - dirty {Boolean} - filter updated, data need to be updated
 * - presets {Array} - list of preset filters
 * - preset {Object} - currently selected preset
 * - filters {Object} - values for the $filter('filter') filter, build in angular filter.
 * - orderBy {Array} - array of member used to sort the input array.
 * - cache {Array} - cached filtered collection to be used in views with last filter results
 * - ??custom - TODO
 */
angular.module('ldAdminTools')
	/*jshint unused:false*/
	.factory('ldFilterService', ['$rootScope', '$filter', 'localStorageService', function ldFilterService($rootScope, $filter, localStorage) {

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

		/**
		 * Apply the preset filter, which is object with filters and orderBy data.
		 * @param data
		 * @param preset
		 */
		function applyPresetFilter(data, preset) {
			if (angular.isUndefined(preset)) {
				return data;
			}

			var filtered = applyFilterFilter(data, preset.filters);
			return applyOrderByFilter(filtered, preset.orderBy);
		}

		/**
		 * Return preset filter from the list of registered (preset) filters.
		 * @param presets
		 * @param id
		 * @returns {*}
		 */
		function getPreset(presets, id) {
			for (var i = 0; i < presets.length; i++) {
				if (presets[i].id === id) {
					return presets[i];
				}
			}

			return null;
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
					filters[filterId] = {dirty: false};
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
			 * Register filters which could be used for filter.
			 * @param filterId
			 * @param list
			 */
			registerPresets: function (filterId, list) {
				var filter = this.getFilter(filterId);
				filter.presets = list;
			},

			/**
			 * Set filter from registered list
			 * @param filterId
			 * @param presetId
			 */
			setPreset: function (filterId, presetId) {
				var filter = this.getFilter(filterId);
				if (angular.isUndefined(filter.presets)) {
					return;
				}

				var preset = getPreset(filter.presets, presetId);
				if (preset === null) {
					return;
				}

				filter.preset = preset;
				filter.dirty = true;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			/**
			 * Get the selected preset from the list
			 * @param filterId
			 */
			getPreset: function (filterId) {
				var filter = this.getFilter(filterId);
				if (angular.isUndefined(filter)) {
					return;
				}

				return filter.preset;
			},

			/**
			 * Clear the preset filter.
			 * @param filterId
			 */
			clearPreset: function (filterId) {
				var filter = this.getFilter(filterId);
				if (angular.isUndefined(filter)) {
					return;
				}
				filter.preset = undefined;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			/**
			 * Set the preset marked as default in the list.
			 * @param filterId
			 */
			setDefaultPreset: function (filterId) {
				var filter = this.getFilter(filterId);
				if (angular.isUndefined(filter) || angular.isUndefined(filter.presets)) {
					return;
				}

				var presets = filter.presets;
				for (var i = 0; i < presets.length; i++) {
					if (presets[i].default) {
						filter.preset = presets[i];
						filter.dirty = true;
						break;
					}
				}

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
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

				if (!filter.dirty) {
					return input;
				}

				var data = input;

				data = applyPresetFilter(data, filter.preset);
				data = applyFilterFilter(data, filter.filter);
				data = applyOrderByFilter(data, filter.orderBy);

				filter.dirty = false;

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

				filter.dirty = true;

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

				filter.dirty = true;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			clearFilterFilter: function (filterId) {
				var filter = this.getFilter(filterId);
				delete filter.filter;

				filter.dirty = true;

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

				filter.dirty = true;

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

				filter.dirty = true;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			clearOrderByFilter: function (filterId) {
				var filter = this.getFilter(filterId);
				delete filter.orderBy;

				filter.dirty = true;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			forceUpdate: function (filterId) {
				var filter = this.getFilter(filterId);
				filter.dirty = true;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			forceUpdateAll: function () {
				angular.forEach(filters, function (filter, filterId) {
					filter.dirty = true;
					$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
				}, this);
			},

			setDirty: function(filterId) {
				this.getFilter(filterId).dirty = true;
			},

			isDirty: function(filterId) {
				return !!this.getFilter(filterId).dirty;
			},

			storeFilters: function () {
				if (localStorage.isSupported) {
					var store = {};
					angular.forEach(filters, function (value, key) {
						store[key] = {
							preset: value.preset,
							filter: value.filter,
							orderBy: value.orderBy
						};
					});
					localStorage.set('filters', angular.toJson(store));
				}
			},

			loadFilters: function () {
				if (localStorage.isSupported) {
					var loaded = angular.fromJson(localStorage.get('filters'));

					if (angular.isDefined(loaded) && loaded === null) {
						loaded = {};
					}

					angular.forEach(loaded, function (value, key) {
						filters[key].preset = value.preset;
						filters[key].filter = value.filter;
						filters[key].orderBy = value.orderBy;
						filters[key].dirty = true;
					});
				}
			}
		};
	}]);

angular.module('ldAdminTools').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('partials/lddashboardbox.html',
    "<div class=\"panel panel-{{ panelType }}\" ng-class=ldSize><div class=\"panel-heading ld-panel-heading clearfix\"><h4 class=\"panel-title ld-panel-title pull-left\">{{ ldTitle }}</h4><div class=\"btn-group pull-right\" dropdown><button class=\"btn btn-xs btn-{{ panelType }}\" ng-click=toggle()><i class=\"fa fa-fw fa-minus\"></i></button> <button class=\"btn btn-xs btn-{{ panelType }}\" ng-click=close()><i class=\"fa fa-fw fa-close\"></i></button> <button class=\"btn btn-xs btn-{{ panelType }} dropdown-toggle\" role=button><span class=caret></span></button><ul class=dropdown-menu role=menu><li><a href=\"\" ng-click=options()>Options</a></li></ul></div></div><div class=panel-collapse collapse=!isOpen><div class=panel-body ng-transclude></div></div></div>"
  );


  $templateCache.put('partials/lddashboardboxgroup.html',
    "<div class=ld-panel-group ng-transclude></div>"
  );


  $templateCache.put('partials/lddatanavigation.html',
    "<div class=ld-data-navigation>{{ filter }}: {{ message }} <a href=\"\" class=\"btn btn-link ld-data-navigation-btn\" ng-if=showPreviousButton ng-class=disablePreviousButtonClass ng-click=previousEntry()><i class=\"fa fa-fw fa-chevron-left fa-lg\"></i></a> <a href=\"\" class=\"btn btn-link ld-data-navigation-btn\" ng-if=showNextButton ng-class=disableNextButtonClass ng-click=nextEntry()><i class=\"fa fa-fw fa-chevron-right fa-lg\"></i></a></div>"
  );


  $templateCache.put('partials/lddropdown.html',
    "<div class=ld-dropdown dropdown><a style=cursor:pointer dropdown-toggle role=button>{{ selected.name }} <i class=\"fa fa-caret-down\"></i></a><ul class=dropdown-menu><li ng-repeat=\"item in list\" ng-class=\"{'divider' : item.divider}\"><a ng-if=!item.divider ng-click=select(item);>{{ item.name }}</a></li></ul></div>"
  );


  $templateCache.put('partials/ldexpandableinput.html',
    "<div class=ld-expandable-input><div class=ld-input-group><span class=ld-input-group-btn ng-class=\"{'relative' : !isOpened}\" ng-style=\"{cursor: isOpened ? 'context-menu': 'pointer'}\" ng-if=\"iconLeft.length>0\" ng-click=open()><i class=\"fa fa-fw {{ iconLeft }} fa-lg\"></i></span> <input class=\"form-control ld-form-control\" ng-model=inputValue placeholder=\"{{ placeholder }}\" ng-show=isOpened ld-input-focus=isFocus ng-blur=\"isFocus=false\"> <span class=ld-input-group-btn ng-if=\"iconRight.length>0\" ng-show=\"inputValue && isOpened\" ng-click=clear()><i class=\"fa fa-fw {{ iconRight }} fa-lg\"></i></span></div><div ng-if=isOpened class=ld-expandable-close><a href=\"\" ng-click=close()>{{ closeText }}</a></div></div>"
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
    "<span class=ld-table-info ng-if=isVisible>{{ infoText }}</span>"
  );


  $templateCache.put('partials/ldtablenavigation.html',
    "<div class=ld-table-navigation><a href=\"\" class=\"btn btn-link ld-table-navigation-btn\" ng-if=showPreviousButton ng-class=disablePreviousButtonClass ng-click=previousPage()><i class=\"fa fa-fw fa-chevron-left fa-lg\"></i></a> <a href=\"\" class=\"btn btn-link ld-table-navigation-btn\" ng-if=showNextButton ng-class=disableNextButtonClass ng-click=nextPage()><i class=\"fa fa-fw fa-chevron-right fa-lg\"></i></a></div>"
  );


  $templateCache.put('partials/ldtablenavigationdropdown.html',
    "<div class=ld-table-navigation-dropdown dropdown><a href=\"\" dropdown-toggle style=cursor:pointer role=button>{{ descriptionText }} <i class=\"fa fa-fw fa-caret-down\"></i></a><ul class=\"dropdown-menu dropdown-menu-right\"><li ng-class=firstPageClass><a href=\"\" ng-click=gotoPage(1)><i class=\"fa fa-fw fa-angle-double-left fa-lg\"></i>{{ firstPage }}</a></li><li ng-class=previousPageClass><a href=\"\" ng-click=\"gotoPage(currentPage - 1)\"><i class=\"fa fa-fw fa-angle-left fa-lg\"></i>{{ previousPage }}</a></li><li ng-repeat=\"page in pages\" ng-class=\"page.active ? 'divider' : ''\"><a href=\"\" ng-if=!page.active ng-click=gotoPage(page.page)><i class=\"fa fa-fw fa-lg\" ng-class=\"page.active ? 'fa-caret-right' : ''\"></i>{{ page.text }}</a></li><li ng-class=nextPageClass><a href=\"\" ng-click=\"gotoPage(currentPage + 1)\"><i class=\"fa fa-fw fa-angle-right fa-lg\"></i>{{ nextPage }}</a></li><li ng-class=lastPageClass><a href=\"\" ng-click=gotoPage(totalPages)><i class=\"fa fa-fw fa-angle-double-right fa-lg\"></i>{{ lastPage }}</a></li></ul></div>"
  );


  $templateCache.put('partials/ldtablepagination.html',
    "<div class=ld-table-pagination><pagination class=ld-pagination ng-show=\"__numPages > 1 && isVisible\" num-pages=__numPages ng-model=currentPage max-size=maxSize total-items=totalItems items-per-page=itemsPerPage boundary-links=true previous-text=&lsaquo; next-text=&rsaquo; first-text=&laquo; last-text=&raquo;></pagination></div>"
  );

}]);
})(angular);