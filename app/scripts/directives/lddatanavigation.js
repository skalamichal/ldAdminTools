'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldDataNavigation
 * @description
 * # ldDataNavigation
 */
angular.module('ldAdminTools')
	.constant('ldDataNavigationConfig', {
		showPreviousButtonDefault: true,
		showNextButtonDefault: true
	})
	.directive('ldDataNavigation', function () {
		return {
			templateUrl: 'partials/ldtablenavigation.html',
			restrict: 'E',
			scope: {
				
			},
			link: function postLink(scope) {

				scope.disablePreviousButtonClass = '';
				scope.disableNextButtonClass = '';

				scope.showPreviousButton = scope.showPreviousButton || config.showPreviousButtonDefault;
				scope.showNextButton = scope.showNextButton || config.showNextButtonDefault;

				function updateNavigation() {
					//scope.disablePreviousButtonClass = (page <= 1 ? 'disabled' : '');
					//scope.disableNextButtonClass = (page >= tableController.getTotalPages() ? 'disabled' : '');
				}

				scope.previousEntry = function () {
				};

				scope.nextEntry = function () {
				};

			}
		};
	});
