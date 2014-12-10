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
	.controller('ldSidebarMenuController', [function () {
		var self = this;
		this.menus = [];

		// register menu block
		this.registerMenu = function (menu) {
			var level = menu.level;
			if (angular.isUndefined(this.menus[level])) {
				this.menus[level] = [];
			}
			this.menus[level].push(menu);

			// setup the menu level style
			menu.menuLevelStyle = 'nav-' + self.getLevelAsString(level) + '-level';
		};

		// open menu function, goes through all menus at the same level and calls its closeMenu function on the scope
		this.openMenu = function(menu) {
			angular.forEach(this.menus[menu.level], function(m) {
				if (m.$id !== menu.$id) {
					m.closeMenu();
				}
			}, this);

			closeAllSubmenus(menu.level);
		};

		// close all submenus
		function closeAllSubmenus(level) {
			angular.forEach(this.menus, function(menu, index) {
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
				'level': '=?level',
				'opened': '=?'
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

				// set opened to true by default
				scope.opened = scope.opened || true;
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