'use strict';

/**
 * @ngdoc directive
 * @name directive:ldResize
 * @description
 * # resize directive to handle window resize
 * The ld-resize parametes is a method to be called when window is resized
 */

angular.module('ldAdminTools')
	.directive('ldResize', ['$window', '$parse', function ($window, $parse) {
		return {
			restrict: 'EA',
			link: function (scope, element, attrs) {
				// wrap the $window to angular jqLite element
				var w = angular.element($window);

				// method to be called when window is resized
				var resizeMethodGetter = $parse(attrs.ldResize);
				var resizeMethod = resizeMethodGetter(scope);

				if (angular.isUndefined(resizeMethod)) {
					return;
				}

				// initialize the "current" size object
				scope.size = {
					width: -1,
					height: -1
				};

				// update the size with the current window size
				scope.updateSize = function () {
					scope.size.width = ($window.innerWidth > 0) ? $window.innerWidth : this.screen.width;
					scope.size.height = ($window.innerHeight > 0) ? $window.innerHeight : this.screen.height;
				};

				// watch for the size changes
				scope.$watchCollection('size', function (newValue) {
					// call the ldOnResize method
					resizeMethod(newValue.width, newValue.height);
				});

				// bind to the window onResize event
				w.bind('resize', function () {
					// execute the updateSize withing in angular framework
					scope.$apply(function () {
						scope.updateSize();
					});
				});

				// initialize
				scope.updateSize();
			}
		};
	}]);