'use strict';

/**
 * @ngdoc directive
 * @name ldAdminToolsApp.directive:ldExpandableInput
 * @description
 * # ldExpandableInput
 */
angular.module('ldAdminTools')
	.constant('ldExpandableInputConfig', {
		placeholderDefault: 'Enter value...',
		closeTextDefault: 'Close',
		openIconDefault: 'fa-toggle-on',
		closeIconDefault: 'fa-toggle-off',
		clearIconDefault: 'fa-remove',
		closeOnToggleDefault: false
	})
	.directive('ldExpandableInput', ['$parse', '$timeout', '$animate', 'ldExpandableInputConfig', function ($parse, $timeout, $animate, config) {
		return {
			templateUrl: 'partials/ldexpandableinput.html',
			restrict: 'E',
			require: '^ngModel',
			scope: {
				model: '=ngModel',
				placeholder: '@?',
				closeText: '@?',
				opened: '=?opened',
				openIcon: '@',
				closeIcon: '@',
				clearIcon: '@',
				onClear: '&?',
				onOpen: '&?',
				onClose: '&?'
			},
			link: function postLink(scope, element) {

				$animate.enabled(false, element);

				function setIconLeft() {
					if (scope.opened) {
						return angular.isUndefined(scope.closeIcon) ? config.closeIconDefault : scope.closeIcon;
					}
					else {
						return angular.isUndefined(scope.openIcon) ? config.openIconDefault : scope.openIcon;
					}
				}

				function updateIcons() {
					scope.iconLeft = setIconLeft();
					scope.iconRight = angular.isUndefined(scope.clearIcon) ? config.clearIconDefault : scope.clearIcon;
				}

				scope.isFocus = false;

				scope.$watch('placeholder', function (newValue) {
					scope.placeholder = angular.isUndefined(newValue) ? config.placeholderDefault : newValue;
				});

				scope.$watch('closeText', function (newValue) {
					scope.closeText = angular.isDefined(newValue) ? newValue : config.closeTextDefault;
				});

				scope.$watch('opened', function () {
					scope.isFocus = scope.opened;
					updateIcons();
				});

				scope.clear = function () {
					scope.model = '';
					scope.isFocus = true;

					if (angular.isFunction(scope.onClear())) {
						scope.onClear()();
					}
				};

				scope.open = function () {
					scope.opened = true;

					if (angular.isFunction(scope.onOpen())) {
						scope.onOpen()();
					}
				};

				scope.close = function () {
					scope.opened = false;

					scope.clear();

					if (angular.isFunction(scope.onClose())) {
						scope.onClose()();
					}
				};

				// init
				updateIcons();
			}
		};
	}]);
