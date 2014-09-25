; (function(angular){
'use strict';
angular.module('ldAdminTools', ['ui.bootstrap']); 
'use strict';

/**
 * @ngdoc directive
 * @name directive:ldMenu
 * @description
 * # sidebar menu directive
 */
angular.module('ldAdminTools')
	.directive('ldMenu', [function () {
		return {
			restrict: 'EA',
			scope: {
				'level': '=?',
				'data': '=',
				'isCollapsed': '=?collapsed',
				'menuTemplate': '=?',
				'options': '=?ldMenuOptions'
			},
			require: '?^ldMenu',
			controller: [function () {
				/**
				 * Return level as string, example "1" -> "first"
				 * @param level - max 3
				 */
				this.getLevelAsString = function (level) {
					if (level === 1) {
						return 'first';
					}
					else if (level === 2) {
						return 'second';
					}
					else if (level === 3) {
						return 'third';
					}

					return '';
				};
			}],
			template: '<ng-include src="getTemplate()"></ng-include>',
			/*jshint unused:false*/
			link: function (scope, element, attrs, menuController) {
				scope.level = scope.level || 1;
				scope.menuLevelStyle = 'nav-' + menuController.getLevelAsString(scope.level) + '-level';

				scope.menuTemplate = scope.menuTemplate || 'partials/ldmenu.html';

				scope.getTemplate = function () {

					return scope.menuTemplate   ;
				};
			}
		};
	}]);

'use strict';

/**
 * @ngdoc directive
 * @name directive:ldResize
 * @description
 * # resize directive to handle window resize
 * @param onResize - method called when window is resized
 */

angular.module('ldAdminTools')
.directive('ldResize', ['$window', function ($window) {
	return {
		restrict: 'EA',
		scope: {
			'ldOnResize': '&'
		},
		link: function (scope) {
			// wrap the $window to angular jqLite element
			var w = angular.element($window);

			// method to be called when window is resized
			var resizeMethod = scope.ldOnResize();

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

angular.module('ldAdminTools').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('partials/ldmenu.html',
    "<ul class=nav ng-class=menuLevelStyle><li ng-repeat=\"item in data\" ng-init=\"isCollapsed=true\"><a ld-menuitem ng-href={{item.url}} ng-click=\"isCollapsed = !isCollapsed\" ld-slide-toggle=item.submenu><i ng-if=\"item.icon.length > 0\" class=\"fa fa-fw {{item.icon}}\"></i> {{ item.text }} <span class=badge ng-if=\"item.badge && item.badge() > 0\">{{ item.badge() }}</span> <span ng-if=item.submenu class=\"fa ld-right\" ng-class=\"isCollapsed? 'fa-angle-left' : 'fa-angle-down'\"></span></a><div ng-if=item.submenu><div ld-menu collapse=isCollapsed data=item.submenu level=\"level + 1\"></div></div></li></ul>"
  );

}]);
})(angular);