'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldHideLeft
 * @description
 * # ldCollapseWidth
 */
angular.module('ldAdminTools')
	.directive('ldSlideLeft', ['$transition', function ($transition) {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs) {
				var initialAnimSkip = true;
				var currentTransition;

				var width = element.prop('offsetWidth');

				function doTransition(change) {
					var newTransition = $transition(element, change);
					if (currentTransition) {
						currentTransition.cancel();
					}
					currentTransition = newTransition;
					newTransition.then(newTransitionDone, newTransitionDone);
					return newTransition;

					function newTransitionDone() {
						// Make sure it's this transition, otherwise, leave it alone.
						if (currentTransition === newTransition) {
							currentTransition = undefined;
						}
					}
				}

				function expand() {
					if (initialAnimSkip) {
						initialAnimSkip = false;
						expandDone();
					} else {
						element.removeClass('ld-hide').addClass('ld-sliding-left');
						doTransition({ left: 0 + 'px' }).then(expandDone);
					}
				}

				function expandDone() {
					element.removeClass('ld-sliding-left');
					element.addClass('ld-slide in');
				}

				function slide() {
					if (initialAnimSkip) {
						initialAnimSkip = false;
						slideDone();
						element.css({left: -width + 'px'});
					} else {
						// CSS transitions don't work with width: auto, so we have to manually change the height to a specific value
						element.css({ left: 0 + 'px' });
						//trigger reflow so a browser realizes that height was updated from auto to a specific value
						var x = element[0].offsetHeight;

						element.removeClass('ld-hide in').addClass('ld-sliding-left');

						doTransition({ left: -width + 'px' }).then(slideDone);
					}
				}

				function slideDone() {
					element.removeClass('ld-sliding-left');
					element.addClass('ld-slide');
				}

				scope.$watch(attrs.ldSlideLeft, function (shouldSlide) {
					if (shouldSlide) {
						slide();
					} else {
						expand();
					}
				});
			}
		};
	}]);
