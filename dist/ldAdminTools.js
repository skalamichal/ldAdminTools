; (function(angular){
'use strict';
angular.module('ldAdminTools', ['ui.bootstrap', 'RecursionHelper']); 
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
				console.log($scope);

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

angular.module('ldAdminTools').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('partials/ldmenu-wrap.html',
    "<ul class=nav ng-class=menuLevelStyle><li ng-repeat=\"item in data\"><ld-menu-item ng-if=!item.submenu data=item></ld-menu-item><ld-submenu-item ng-if=item.submenu data=item level=level></ld-submenu-item></li></ul>"
  );


  $templateCache.put('partials/ldmenuitem.html',
    "<a class=ld-menuitem ng-href={{item.url}} ld-slide-toggle><i ng-if=\"item.icon.length > 0\" class=\"fa fa-fw {{item.icon}}\"></i> {{ item.text }} <span class=badge ng-if=\"item.badge && item.badge() > 0\">{{ item.badge() }}</span></a>"
  );


  $templateCache.put('partials/ldsubmenuitem.html',
    "<div><a class=ld-menuitem ng-href={{item.url}} ng-click=toggle()><i ng-if=\"item.icon.length > 0\" class=\"fa fa-fw {{item.icon}}\"></i> {{ item.text }} <span class=badge ng-if=\"item.badge && item.badge() > 0\">{{ item.badge() }}</span> <span class=\"fa ld-right\" ng-class=collapsedClass()></span></a><ld-menu collapse=isCollapsed() data=item.submenu level=\"level + 1\"></ld-menu></div>"
  );

}]);
})(angular);