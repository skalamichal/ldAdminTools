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

