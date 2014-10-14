'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldFilterDropdown
 * @description
 * # ldFilterDropdown
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
		link: function (scope, element, attrs) {

			scope.selectFilter = function (filter) {
				scope.selectedFilter = filter;
			};

			scope.selectFilter(scope.filters[0]);
		}
	};
}]);

