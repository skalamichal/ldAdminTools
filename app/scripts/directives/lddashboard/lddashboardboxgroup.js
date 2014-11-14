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