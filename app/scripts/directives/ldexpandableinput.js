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
	.directive('ldExpandableInput', ['$parse', '$timeout', 'ldExpandableInputConfig', function ($parse, $timeout, config) {
		return {
			templateUrl: 'partials/ldexpandableinput.html',
			restrict: 'E',
			require: '^ngModel',
			scope: {
				model: '=ngModel',
				placeholder: '@?',
				closeText: '@',
				opened: '=?',
				openIcon: '@',
				closeIcon: '@',
				clearIcon: '@',
				onClear: '&?',
				onOpen: '&?',
				onClose: '&?'
			},
			link: function postLink(scope) {

				function setIconLeft() {
					if (scope.isOpened) {
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

				scope.isOpened = !!scope.isOpened;
				scope.inputValue = scope.model;
				scope.isFocus = false;

				scope.$watch('placeholder', function (newValue) {
					scope.placeholder = angular.isUndefined(newValue) ? config.placeholderDefault : newValue;
				});

				scope.$watch('closeText', function (newValue) {
					scope.closeText = angular.isDefined(newValue) ? newValue : config.closeTextDefault;
				});

				scope.$watch('inputValue', function (newValue) {
					scope.model = newValue;
				});

				scope.$watch('model', function (newValue) {
					scope.inputValue = newValue;
				});

				scope.$watch('isOpened', function (newValue) {
					scope.opened = !!newValue;
					scope.isFocus = scope.opened;
					updateIcons();
				});

				scope.$watch('opened', function (newValue) {
					scope.isOpened = !!newValue;
					scope.isFocus = scope.isOpened;
					updateIcons();
				});

				scope.clear = function () {
					scope.inputValue = '';
					scope.isFocus = true;

					if (angular.isFunction(scope.onClear())) {
						scope.onClear()();
					}
				};

				scope.open = function () {
					scope.isOpened = true;

					if (angular.isFunction(scope.onOpen())) {
						scope.onOpen()();
					}
				};

				scope.close = function () {
					scope.isOpened = false;

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
