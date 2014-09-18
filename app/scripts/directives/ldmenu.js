'use strict';

/**
 * @ngdoc directive
 * @name directive:ldMenu
 * @description
 * # sidebar menu directive
 */
angular.module('ldAdminTools')
	.directive('ldMenu', [function () {
		return {
			restrict: 'EA',
			scope: {
				'level': '=?',
				'data': '=',
				'isCollapsed': '=?collapsed',
				'menuTemplate': '=?',
				'options': '=?ldMenuOptions'
			},
			require: '?^ldMenu',
			controller: [function () {
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
			}],
			template: '<ng-include src="getTemplate()"></ng-include>',
			/*jshint unused:false*/
			link: function (scope, element, attrs, menuController) {
				scope.level = scope.level || 1;
				scope.menuLevelStyle = 'nav-' + menuController.getLevelAsString(scope.level) + '-level';

				scope.menuTemplate = scope.menuTemplate || 'partials/ldmenu.html';

				scope.getTemplate = function () {

					return scope.menuTemplate   ;
				};
			}
		};
	}]);
