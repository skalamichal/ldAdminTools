'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTablePageRows
 * @description
 * # ldTablePageRows
 * Setup pagination rowsPerPage for the ld-table, otherwise no pagination is used
 */
angular.module('ldAdminTools')
	.directive('ldTablePageRows', ['$parse', function ($parse) {
		return {
			restrict: 'A',
			require: '^ldTable',
			link: function (scope, element, attrs, tableController) {
				var rowsPerPageGetter = $parse(attrs.ldTablePageRows);

				// watch if the value is changed
				scope.$watch(rowsPerPageGetter, function (newValue) {
					tableController.setupPaging(newValue, 1);
				});
			}
		};
	}]);