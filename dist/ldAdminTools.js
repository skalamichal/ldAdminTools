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
 * @name ldAdminTools.directive:ldHideLeft
 * @description
 * # ldCollapseWidth
 */
angular.module('ldAdminTools')
	.controller('ldSlideLeftController', [function()
	{
	}])
	.directive('ldSlideLeft', ['$transition', function ($transition) {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs) {
				var initialAnimSkip = true;
				var currentTransition;
				var skipAnimation = false;

				var width = element.prop('offsetWidth');

				function doTransition(change) {
					function newTransitionDone() {
						// Make sure it's this transition, otherwise, leave it alone.
						if (currentTransition === newTransition) {
							currentTransition = undefined;
						}
					}
					var newTransition = $transition(element, change);
					if (currentTransition) {
						currentTransition.cancel();
					}
					currentTransition = newTransition;
					newTransition.then(newTransitionDone, newTransitionDone);
					return newTransition;

				}

				function expand() {
					if (initialAnimSkip || skipAnimation) {
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
					if (initialAnimSkip || skipAnimation) {
						initialAnimSkip = false;
						slideDone();
						element.css({left: -width + 'px'});
					} else {
						// CSS transitions don't work with width: auto, so we have to manually change the height to a specific value
						element.css({ left: 0 + 'px' });
						//trigger reflow so a browser realizes that height was updated from auto to a specific value

						/*jshint unused:false*/
						var x = element[0].offsetLeft;

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

angular.module('ldAdminTools').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('partials/ldmenu.html',
    "<ul class=nav ng-class=menuLevelStyle><li ng-repeat=\"item in data\" ng-init=\"isCollapsed=true\"><a ld-menuitem ng-href={{item.url}} ng-click=\"isCollapsed = !isCollapsed\"><i ng-if=\"item.icon.length > 0\" class=\"fa fa-fw {{item.icon}}\"></i> {{ item.text }} <span class=badge ng-if=\"item.badge && item.badge() > 0\">{{ item.badge() }}</span> <span ng-if=item.submenu class=\"fa ld-right\" ng-class=\"isCollapsed? 'fa-angle-left' : 'fa-angle-down'\"></span></a><div ng-if=item.submenu><div ld-menu collapse=isCollapsed data=item.submenu level=\"level + 1\"></div></div></li></ul>"
  );

}]);
})(angular);