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
	.directive('ldDataNavigation', ['$location', 'ldDataNavigationConfig', function ($location, config) {
		return {
			templateUrl: 'partials/lddatanavigation.html',
			restrict: 'E',
			scope: {
				data: '=',
				viewUrl: '@',
				currentId: '=',
				filter: '=?'
			},
			link: function postLink(scope) {
				scope.disablePreviousButtonClass = '';
				scope.disableNextButtonClass = '';

				scope.showPreviousButton = scope.showPreviousButton || config.showPreviousButtonDefault;
				scope.showNextButton = scope.showNextButton || config.showNextButtonDefault;

				angular.forEach(scope.data, function(item, index) {
					if (item.id === scope.currentId) {
						scope.currentIndex = index;
					}
				});

				function updateNavigation() {
					scope.disablePreviousButtonClass = (scope.currentIndex <= 0 ? 'disabled' : '');
					scope.disableNextButtonClass = (scope.currentIndex >= scope.data.length - 1 ? 'disabled' : '');
				}

				scope.previousEntry = function () {
					scope.index = scope.currentIndex - 1;
				};

				scope.nextEntry = function () {
					scope.index = scope.currentIndex + 1;
				};

				scope.$watch('index', function(newIndex) {
					if (angular.isUndefined(newIndex)) {
						return;
					}
					var item = scope.data[newIndex];
					var path = scope.viewUrl.replace('{0}', item.id);
					$location.url(path);
				});

				updateNavigation();
			}
		};
	}]);
