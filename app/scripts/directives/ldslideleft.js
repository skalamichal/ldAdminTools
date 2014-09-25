'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldSlideLeft
 * @description
 * Directive which allows the DOM element to slide to the left and hide the element.
 * Usage:
 * <div ld-slide-left="boolean value"></div>
 * Options:
 * ld-slide-left - boolean - shows the element
 * ld-animated - boolean - turns on/off the animation
 * ld-closeable - boolean - allows to hide the element
 */
angular.module('ldAdminTools')
	.controller('ldSlideLeftController', ['$scope', '$transition', '$attrs', '$parse', function ($scope, $transition, $attrs, $parse) {
		var self = this;
		var scope = $scope.$new();
		var currentTransition;

		var getIsAnimated;
		var setIsAnimated = angular.noop;

		var getIsOpen = $parse($attrs.ldSlideLeft);
		var setIsOpen = getIsOpen.assign;

		var getIsCloseable;
		var setIsCloseable = angular.noop;

		scope.initialAnimSkip = true;
		scope.isAnimated = true;
		scope.isCloseable = false;
		scope.isOpen = true;

		this.init = function (element) {
			self.$element = element;
			scope.width = self.$element[0].offsetWidth;

			// check if ld-isAnimated is set and set watcher function to handle changes
			if ($attrs.ldAnimated) {
				getIsAnimated = $parse($attrs.ldAnimated);
				setIsAnimated = getIsAnimated.assign;

				// watch the attribute in the parent scope
				$scope.$watch(getIsAnimated, function (value) {
					scope.isAnimated = !!value;
				});
			}

			// check if ld-isCloseable is set and set watcher function to handle changes
			if ($attrs.ldCloseable) {
				getIsCloseable = $parse($attrs.ldCloseable);
				setIsCloseable = getIsCloseable.assign;

				$scope.$watch(getIsCloseable, function(value) {
					scope.isCloseable = !!value;
				});
			}

			$scope.$watch($attrs.ldSlideLeft, function (open) {
				scope.isOpen = !!open;
			});
		};

		this.toggle = function (open) {
			scope.isOpen = arguments.length ? !!open : !scope.isOpen;
			setIsOpen($scope, scope.isOpen);
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
			if (!scope.isAnimated || scope.initialAnimSkip) {
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
			if (scope.initialAnimSkip || !scope.isAnimated) {
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

		function update() {
			if (scope.isOpen) {
				self.expand();
			}
			else {
				self.slide();
			}
		}

		scope.$watch('isOpen', function(shouldOpen) {
			// if not isCloseable and we should close, it's not allowed, switch back to isOpen true
			if (!scope.isCloseable && !shouldOpen) {
				scope.isOpen = true;
				setIsOpen($scope, scope.isOpen);
			}
			update();
		});

		scope.$watch('isCloseable', function(closeable) {
			if (!closeable && !scope.isOpen)
			{
				scope.isOpen = true;
				setIsOpen($scope, scope.isOpen);
			}
			update();

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
