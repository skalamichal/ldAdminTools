'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldHideLeft
 * @description
 * # ldCollapseWidth
 */
angular.module('ldAdminTools')
	.controller('ldSlideLeftController', ['$scope', '$transition', '$attrs', '$parse', function ($scope, $transition, $attrs, $parse) {
		var self = this;
		var scope = $scope.$new();
		var currentTransition;

		var getIsAnimated;
		var setIsAnimated = angular.noop;

		var getIsSlide = $parse($attrs.ldSlideLeft);
		var setIsSlide = getIsSlide.assign;

		scope.initialAnimSkip = true;
		scope.animated = true;

		this.init = function (element) {
			self.$element = element;
			scope.width = self.$element[0].offsetWidth;

			if ($attrs.ldSlideLeftAnimated) {
				getIsAnimated = $parse($attrs.ldSlideLeftAnimated);
				setIsAnimated = getIsAnimated.assign;

				$scope.$watch(getIsAnimated, function (value) {
					scope.animated = !!value;
				});
			}

			$scope.$watch($attrs.ldSlideLeft, function (shouldSlide) {
				scope.shouldSlide = !!shouldSlide;
			});
		};

		this.toggle = function (slide) {
			scope.shouldSlide = arguments.length ? !!slide : !scope.shouldSlide;
			setIsSlide($scope, scope.shouldSlide);
		};

		function doTransition(change) {
			function newTransitionDone() {
				// Make sure it's this transition, otherwise, leave it alone.
				if (currentTransition === newTransition) {
					currentTransition = undefined;
				}
			}

			var newTransition = $transition(self.$element, change);
			if (currentTransition) {
				currentTransition.cancel();
			}
			currentTransition = newTransition;
			newTransition.then(newTransitionDone, newTransitionDone);
			return newTransition;

		}

		this.expand = function () {
			if (!scope.animated || scope.initialAnimSkip) {
				scope.initialAnimSkip = false;
				expandDone();
			}
			else {
				self.$element.removeClass('ld-slide').addClass('ld-sliding-left');
				doTransition({ left: 0 + 'px' }).then(expandDone);
			}
		};

		function expandDone() {
			self.$element.css('left', '0px');
			self.$element.removeClass('ld-sliding-left');
			self.$element.addClass('ld-slide in');
		}

		this.slide = function () {
			if (scope.initialAnimSkip || !scope.animated) {
				scope.initialAnimSkip = false;
				slideDone();
				self.$element.css({left: -scope.width + 'px'});
			}
			else {
				// CSS transitions don't work with width: auto, so we have to manually change the height to a specific value
				self.$element.css({ left: 0 + 'px' });
				//trigger reflow so a browser realizes that height was updated from auto to a specific value
				/*jshint unused:false*/
				var x = self.$element[0].offsetLeft;

				self.$element.removeClass('ld-slide in').addClass('ld-sliding-left');

				doTransition({ left: -scope.width + 'px' }).then(slideDone);
			}
		};

		function slideDone() {
			self.$element.css('left', '-' + scope.width + 'px');
			self.$element.removeClass('ld-sliding-left in');
			self.$element.addClass('ld-slide');
		}

		scope.$watch('shouldSlide', function(shouldSlide) {
			if (shouldSlide) {
				self.slide();
			}
			else {
				self.expand();
			}
		});

	}])
	.directive('ldSlideLeft', [function () {
		return {
			restrict: 'A',
			controller: 'ldSlideLeftController',
			link: function postLink(scope, element, attrs, controller) {
				controller.init(element);
			}
		};
	}])
	.directive('ldSlideToggle', [function()
	{
		return {
			require: '?^ldSlideLeft',
			/*jshint unused:false*/
			link: function (scope, element, attrs, slideController) {
				if (!slideController) {
					return;
				}

				function toggleSlide() {
					scope.$apply(function() {
						slideController.toggle();
					});
				}

				scope.$watch(attrs.ldSlideToggle, function(value)
				{
					if (!angular.isDefined(value) || value.length === 0) {
						element.on('click', toggleSlide);

						scope.$on('$destroy', function () {
							element.off('click', toggleSlide());
						});
					}
				});
			}
		};
	}]);
