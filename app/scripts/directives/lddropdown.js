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
	.directive('ldDropdown', ['$filter', function ($filter) {
		return {
			restrict: 'EA',
			scope: {
				selectedItem: '=?',
				list: '=',
				onchanged: '&?'
			},
			templateUrl: 'partials/lddropdown.html',
			link: function (scope) {
				scope.select = function (item) {
					if (!item) {
						return;
					}

					if (angular.isDefined(scope.onchanged) && angular.isDefined(scope.onchanged())) {
						scope.onchanged()(item);
					}
				};

				if (angular.isUndefined(scope.selectedItem) && angular.isDefined(scope.list) && scope.list.length > 0) {
					var selectedItem = $filter('filter')(scope.list, {id: scope.selectedItem.id});
					scope.select(selectedItem ? selectedItem[0] : scope.list[0]);
				}
			}
		};
	}]);

