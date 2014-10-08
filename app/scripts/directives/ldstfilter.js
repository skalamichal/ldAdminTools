'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldStFilter
 * @description
 * # Filter for the angular-smart-table, which is required to use.
 */
angular.module('ldAdminTools')
	.directive('ldStFilter', function () {
		return {
			restrict: 'A',
			require: '^stTable',
			link: function postLink(scope, element, attrs, stTableController) {
				scope.$watch(attrs.ldStFilter, function(value) {
					if (value) {
						stTableController.search(value.value, value.key);
					}
				});
			}
		};
	});