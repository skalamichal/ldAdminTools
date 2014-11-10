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
		clearIconDefault: 'fa-remove'
	})
	.directive('ldExpandableInput', ['ldExpandableInputConfig', function (config) {
		return {
			templateUrl: 'partials/ldexpandableinput.html',
			restrict: 'E',
			require: '^ngModel',
			scope: {
				model: '=ngModel',
				placeholder: '@?',
				closeText: '@',
				expanded: '=?',
				openIcon: '@',
				closeIcon: '@',
				clearIcon: '@',
				onClear: '&?',
				onToggle: '&?'
			},
			link: function postLink(scope) {
				function setIconLeft() {
					if (scope.isExpanded) {
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

				scope.isExpanded = !!scope.expanded;
				scope.inputValue = scope.model;

				scope.$watch('placeholder', function (newValue) {
					scope.placeholder = angular.isUndefined(scope.placeholder) ? config.placeholderDefault : scope.placeholder;
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

				scope.$watch('isExpanded', function (newValue) {
					scope.expanded = !!newValue;
					updateIcons();
				});

				scope.$watch('expanded', function (newValue) {
					scope.isExpanded = !!newValue;
					updateIcons();
				});

				scope.clear = function () {
					scope.inputValue = '';

					if (angular.isDefined(scope.onClear)) {
						scope.onClear()();
					}
				};

				scope.toggle = function () {
					scope.isExpanded = !scope.isExpanded;
					if (angular.isDefined(scope.onToggle)) {
						scope.onToggle()(scope.isExpanded);
					}
				};

				scope.close = function () {
					scope.clear();
					scope.toggle();
				};

				// init
				updateIcons();
			}
		};
	}]);
