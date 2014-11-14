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
				ldSize: '@?'
			},
			link: function postLink(scope, element, attrs) {
				scope.panelType = scope.ldType || config.panelTypeDefault;
				scope.isOpen = angular.isDefined(scope.ldIsOpen) ? !!scope.ldIsOpen : true;

				scope.close = function() {
					element.remove();
				};

				scope.toggle = function() {
					scope.ldIsOpen = scope.isOpen = !scope.isOpen;
				};
			}
		};
	}]);