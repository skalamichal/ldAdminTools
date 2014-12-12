'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldDataNavigation
 * @description
 * # ldDataNavigation
 * Allows navigation between views by id, which is send in an array of view ids and current id. Optional is the filter send
 * which is then displayed as 'filter name': index of total
 * The view-url is a url string with the format 'url {0}' where the {0} is replaced with the view id.
 */
angular.module('ldAdminTools')
	.constant('ldDataNavigationConfig', {
		messageDefault: '{0} of {1}',   // the page of pages message, where the {0} is replaced by current page number and
                                        // {1} with the total pages
		showPreviousButtonDefault: true,
		showNextButtonDefault: true
	})
	.directive('ldDataNavigation', ['$location', 'ldDataNavigationConfig', function ($location, config) {
		return {
			templateUrl: 'partials/lddatanavigation.html',
			restrict: 'E',
			scope: {
				data: '=', // array with ids
				viewUrl: '@',
				currentId: '=',
				filter: '@?'
			},
			link: function postLink(scope) {
				var message = scope.message || config.messageDefault;

				scope.showPreviousButton = scope.showPreviousButton || config.showPreviousButtonDefault;
				scope.showNextButton = scope.showNextButton || config.showNextButtonDefault;

				scope.currentIndex = scope.data.indexOf(scope.currentId);

				function updateNavigation() {
					var msg = message.replace('{0}', scope.currentIndex + 1);
					msg = msg.replace('{1}', scope.data.length);
					scope.message = msg;
				}

				scope.previousEntry = function () {
					scope.index = scope.currentIndex - 1;
				};

				scope.nextEntry = function () {
					scope.index = scope.currentIndex + 1;
				};

				scope.$watch('index', function (newIndex) {
					if (angular.isUndefined(newIndex)) {
						return;
					}
					var path = scope.viewUrl.replace('{0}', scope.data[newIndex]);
					$location.url(path);
				});

				updateNavigation();
			}
		};
	}]);
