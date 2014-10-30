'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTableNavigation
 * @description
 * # ldTableNavigation
 * Simple navigation directive, which displays previous and next button
 */
angular.module('ldAdminTools')
	.constant('ldTableNavigationConfig', {
		showPreviousButtonDefault: true,
		showNextButtonDefault: true
	})
	.directive('ldTableNavigation', ['ldTableNavigationConfig', function (config) {
		return {
			restrict: 'EA',
			require: '^ldTable',
			templateUrl: 'partials/ldtablenavigation.html',
			scope: {
				showPreviousButton: '=?',
				showNextButton: '=?'
			},
			/*jshint unused:false*/
			link: function (scope, element, attrs, tableController) {
				scope.disablePreviousButtonClass = '';
				scope.disableNextButtonClass = '';

				scope.showPreviousButton = scope.showPreviousButton || config.showPreviousButtonDefault;
				scope.showNextButton = scope.showNextButton || config.showNextButtonDefault;

				function updateNavigation() {
					var page = tableController.getCurrentPage();
					scope.disablePreviousButtonClass = (page <= 1 ? 'disabled' : '');
					scope.disableNextButtonClass = (page >= tableController.getTotalPages() ? 'disabled' : '');
				}

				scope.$on(tableController.TABLE_UPDATED, function () {
					updateNavigation();
				});

				scope.previousPage = function () {
					tableController.setPage(tableController.getCurrentPage() - 1);
				};

				scope.nextPage = function () {
					tableController.setPage(tableController.getCurrentPage() + 1);
				};
			}
		};
	}]);