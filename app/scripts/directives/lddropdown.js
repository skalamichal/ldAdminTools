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

				if (angular.isDefined(scope.onchanged) && angular.isDefined(scope.onchanged())) {
					scope.onchanged()(item);
				}
			};

			if (angular.isUndefined(scope.selected) && angular.isDefined(scope.list) && scope.list.length > 0) {
				scope.select(scope.list[0]);
			}
		}
	};
}]);

