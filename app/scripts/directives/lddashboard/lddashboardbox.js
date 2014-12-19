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
			link: function postLink(scope, element) {
				scope.panelType = scope.ldType || config.panelTypeDefault;
				scope.isBoxOpen = angular.isDefined(scope.ldIsOpen) ? !!scope.ldIsOpen : true;

				scope.close = function() {
					if (angular.isDefined(scope.ldOnClose())) {
						scope.ldOnClose()();
					}

					element.remove();
				};

				scope.toggle = function() {
					scope.ldIsOpen = scope.isBoxOpen = !scope.isBoxOpen;

					if (angular.isDefined(scope.ldOnToggle())) {
						scope.ldOnToggle()(scope.ldIsOpen);
					}
				};
			}
		};
	}]);