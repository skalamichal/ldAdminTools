; (function(angular){
'use strict';
angular.module('ldAdminTools', ['ui.bootstrap', 'RecursionHelper']); 
'use strict';

/**
 * @ngdoc directive
 * @name directive:ldMenu
 * @description
 * # sidebar menu directive
 */
angular.module('ldAdminTools')
	.constant('ldMenuConfig', {
		level: 1
	})
	.controller('ldMenuController', ['$scope', '$parse', '$attrs', 'ldMenuConfig', function ($scope, $parse, $attrs, config) {

		//var self = this;

		// create new scope
		//var scope = $scope.$new();
		var level = angular.isDefined($attrs.level) ? $scope.$eval($attrs.level) : config.level;

		console.log(level);

		/**
		 * Return level as string, example "1" -> "first"
		 * @param level - max 3
		 */
		this.getLevelAsString = function () {
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

		this.getLevel = function () {
			return level;
		};
	}])
	.directive('ldMenu', ['RecursionHelper', function (recursionHelper) {
		return {
			restrict: 'EA',
			scope: {
				'data': '=',
				'options': '=?ldMenuOptions'
			},
			require: '?^ldMenu',
			controller: 'ldMenuController',
			replace: true,
			templateUrl: 'partials/ldmenu.html',
			/*jshint unused:false*/
			compile: function(element) {
				return recursionHelper.compile(element, function(scope, element, attrs, menuController) {
				});
			}
		};
	}])
	.directive('ldMenuItem', ['RecursionHelper', function (recursionHelper) {
		return {
			restrict: 'EA',
			require: '?^ldMenu',
			scope: {
				item: '=data'
			},
			replace: true,
			templateUrl: 'partials/ldmenuitem.html',
			/*jshint unused:false*/
			compile: function(element) {
				return recursionHelper.compile(element, function(scope, element, attrs, menuController) {
				});
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
	.constant('ldSlideLeftConfig', {
		// slide animation is by default on
		isAnimated: true,
		// the element is by default not closeable
		isCloseable: false
	})
	.controller('ldSlideLeftController', ['$scope', '$transition', '$attrs', '$parse', 'ldSlideLeftConfig', function ($scope, $transition, $attrs, $parse, config) {
		var self = this;
		var scope = $scope.$new();
		var currentTransition;

		// getter and setter for the ldAnimated value
		var getIsAnimated;
		var setIsAnimated = angular.noop;

		// getter and setter for the ldSlideLeft value, which has the open/close state
		var getIsOpen = $parse($attrs.ldSlideLeft);
		var setIsOpen = getIsOpen.assign;

		// getter and setter for the ldCloseable value
		var getIsCloseable;
		var setIsCloseable = angular.noop;

		// default properties
		var width = 0;
		var initialAnimSkip = true;

		// these properties may be defined in the directive, check if they are defined and get the value from them
		// or use the config value
		scope.isAnimated = angular.isDefined($attrs.ldAnimated) ? $scope.$eval($attrs.ldAnimated) : config.isAnimated;
		scope.isCloseable = angular.isDefined($attrs.ldCloseable) ? $scope.$eval($attrs.ldCloseable) : config.isCloseable;
		scope.isOpen = $scope.$eval($attrs.ldSlideLeft);

		// initialize the controller with element for sliding
		this.init = function (element) {
			self.$element = element;
			width = self.$element[0].offsetWidth;

			// check if ld-isAnimated is set and set watcher function to handle changes
			if (angular.isDefined($attrs.ldAnimated)) {
				getIsAnimated = $parse($attrs.ldAnimated);
				setIsAnimated = getIsAnimated.assign;

				// watch the attribute in the parent scope
				$scope.$watch(getIsAnimated, function (value) {
					// and update our scope variable so we can watch it's state
					scope.isAnimated = !!value;
				});
			}

			// check if ld-isCloseable is set and set watcher function to handle changes
			if (angular.isDefined($attrs.ldCloseable)) {
				getIsCloseable = $parse($attrs.ldCloseable);
				setIsCloseable = getIsCloseable.assign;

				// watch the attribute in the parent scope
				$scope.$watch(getIsCloseable, function(value) {
					// and update our scope variable so we can watch it's state
					scope.isCloseable = !!value;
				});
			}

			// the ld-slide-left is always set, because it's the directive name
			// watch the parent scope value
			$scope.$watch($attrs.ldSlideLeft, function (open) {
				// and update our scope variable so we can watch it's state
				scope.isOpen = !!open;
			});
		};

		// public controller API method
		this.toggle = function (open) {
			scope.isOpen = arguments.length ? !!open : !scope.isOpen;
			// update the parent scope as well
			setIsOpen($scope, scope.isOpen);
		};

		// perform the transition
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

		// expand (show) the element
		this.expand = function () {
			if (!scope.isAnimated || initialAnimSkip) {
				initialAnimSkip = false;
				expandDone();
			}
			else {
				self.$element.removeClass('ld-slide').addClass('ld-sliding-left');
				doTransition({ left: 0 + 'px' }).then(expandDone);
			}
		};

		// transition is done
		function expandDone() {
			self.$element.css('left', '0px');
			self.$element.removeClass('ld-sliding-left');
			self.$element.addClass('ld-slide in');
		}

		// slide (close) the element
		this.slide = function () {
			if (initialAnimSkip || !scope.isAnimated) {
				initialAnimSkip = false;
				slideDone();
				self.$element.css({left: -width + 'px'});
			}
			else {
				// CSS transitions don't work with width: auto, so we have to manually change the height to a specific value
				self.$element.css({ left: 0 + 'px' });
				//trigger reflow so a browser realizes that height was updated from auto to a specific value
				/*jshint unused:false*/
				var x = self.$element[0].offsetLeft;

				self.$element.removeClass('ld-slide in').addClass('ld-sliding-left');

				doTransition({ left: -width + 'px' }).then(slideDone);
			}
		};

		// transition is done
		function slideDone() {
			self.$element.css('left', '-' + width + 'px');
			self.$element.removeClass('ld-sliding-left in');
			self.$element.addClass('ld-slide');
		}

		// update the element based on the isOpen state
		function update() {
			if (scope.isOpen) {
				self.expand();
			}
			else {
				self.slide();
			}
		}

		// watch for the isOpen scope variable changes
		scope.$watch('isOpen', function(shouldOpen) {
			// if not isCloseable and we should close, it's not allowed, switch back to isOpen true
			if (!scope.isCloseable && !shouldOpen) {
				scope.isOpen = true;
				setIsOpen($scope, scope.isOpen);
			}
			update();
		});

		// watch for the isCloseable scope variable changes
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
			// use the ldSlideLeftController defined above
			controller: 'ldSlideLeftController',
			link: function postLink(scope, element, attrs, controller) {
				// initialize the controller
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

				// toggle the element visibility (slide it)
				function toggleSlide() {
					scope.$apply(function() {
						slideController.toggle();
					});
				}

				// watch for the ld-slide-toggle value
				scope.$watch(attrs.ldSlideToggle, function(value)
				{
					if (!angular.isDefined(value) || value.length === 0) {
						element.on('click', toggleSlide);

						// remove the handler, when directive is removed
						scope.$on('$destroy', function () {
							element.off('click', toggleSlide);
						});
					}
				});
			}
		};
	}]);

angular.module('ldAdminTools').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('partials/ldmenu.html',
    "<ul class=nav ng-class=menuLevelStyle><li ng-repeat=\"item in data\"><ld-menu-item data=item></ld-menu-item></li></ul>"
  );


  $templateCache.put('partials/ldmenuitem.html',
    "<a ld-menuitem ng-href={{item.url}} ng-click=\"isCollapsed = !isCollapsed\" ld-slide-toggle=item.submenu><i ng-if=\"item.icon.length > 0\" class=\"fa fa-fw {{item.icon}}\"></i> {{ item.text }} <span class=badge ng-if=\"item.badge && item.badge() > 0\">{{ item.badge() }}</span> <span ng-if=item.submenu class=\"fa ld-right\" ng-class=\"isCollapsed? 'fa-angle-left' : 'fa-angle-down'\"></span></a>"
  );

}]);
})(angular);