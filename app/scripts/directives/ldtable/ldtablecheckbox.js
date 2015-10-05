'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTableCheckbox
 * @description
 * # ldTableCheckbox
 * ldTableCheckbox allows to place the select all/none checkbox to the table, which will mark all currently displayed
 * items in the table as selected or not selected.
 */
angular.module('ldAdminTools')
	.directive('ldTableCheckbox', ['ldAdminToolsEvents', '$rootScope', function (ldAdminToolsEvents, $rootScope) {
		return {
			template: '<ld-checkbox onchanged="updateSelection" indeterminate="isIndeterminate" checked="isChecked"></ld-checkbox>',
			require: '^ldTable',
			scope: true,
			restrict: 'E',
			link: function postLink(scope, element, attrs, tableController) {

				var watchRows = [];

				function getSelectedItemsCount(data) {
					var count = 0;
					angular.forEach(data, function (item) {
						if (item.selected) {
							count++;
						}
					});
					return count;
				}

				scope.updateSelection = function updateSelection(select) {
					if (select) {
						selectAll();
					}
					else {
						selectNone();
					}
				};

				function selectAll() {
					watchRows = [];
					angular.forEach(tableController.getRows(), function (row) {
						row.selected = true;
						watchRows.push(row);
					});
				}

				function selectNone() {
					watchRows = [];
					angular.forEach(tableController.getRows(), function (row) {
						row.selected = false;
					});
				}

				function tableUpdated() {
					var dataRows = tableController.getRows();
					var selectedItems = getSelectedItemsCount(dataRows);
					watchRows = [].concat(dataRows);
					scope.isIndeterminate = (selectedItems > 0 && selectedItems < dataRows.length);
					scope.isChecked = (dataRows.length > 0 && selectedItems === dataRows.length);
					$rootScope.$broadcast(ldAdminToolsEvents.TABLE_ROW_SELECTION_CHANGED, selectedItems);
				}

				scope.$watch(function () {
						return watchRows;
					}, function () {
						tableUpdated();
					},
					true);

				scope.$on(tableController.TABLE_UPDATED, function () {
					tableUpdated();
				});
			}
		}
			;
	}])
;
