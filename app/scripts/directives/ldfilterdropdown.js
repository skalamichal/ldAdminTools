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
		template: function () {
			var tpl = '<div class="ld-filter-dropdown" dropdown>';
			tpl += '<a style="cursor: pointer" dropdown-toggle role="button">{{ selectedFilter.name }} <i class="fa fa-caret-down"></i></a>';
			tpl += '<ul class="dropdown-menu">';
			tpl += '<li ng-repeat="filter in filters"><a ng-click="selectFilter(filter);">{{ filter.name }}</a></li>';
			tpl += '</ul>';
			tpl += '</div>';

			return tpl;
		},
		link: function (scope, element, attrs) {

			scope.selectFilter = function (filter) {
				scope.selectedFilter = filter;
			};

			scope.selectFilter(scope.filters[0]);
		}
	};
}]);

