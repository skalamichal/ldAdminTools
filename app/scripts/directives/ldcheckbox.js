'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldThreeStateCheckbox
 * @description
 * # ldThreeStateCheckbox
 */
angular.module('ldAdminTools')
	.directive('ldCheckbox', function () {
		return {
			template: '<input type="checkbox" ng-change="onChanged()" ng-model="checked">',
			restrict: 'E',
			scope: {
				checked: '=?',
				indeterminate: '=?',
				onchanged: '&?'
			},
			link: function postLink(scope, element) {
				scope.onChanged = function () {
					if (scope.indeterminate) {
						scope.indeterminate = false;
						scope.checked = false;
					}
					if (angular.isDefined(scope.onchanged)) {
						scope.onchanged()(scope.checked);
					}
				};

				scope.$watch('indeterminate', function (value) {
					value = !!value;
					element.find('input').prop('indeterminate', value);
				});
			}
		};
	});
