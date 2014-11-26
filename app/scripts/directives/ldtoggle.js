'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldToggle
 * @description
 * # ldToggle
 */
angular.module('ldAdminTools')
	.controller('ldToggleController', ['$scope', '$attrs', '$parse', '$timeout', function ($scope, $attrs, $parse, $timeout) {
		var property = $attrs.ldToggle;
		var getter = $parse(property);
		var setter = getter.assign;

		var current = getter($scope);

		$scope.$watch(getter, function (newValue, oldValue) {
			if (newValue !== oldValue && current !== newValue) {
				current = !!newValue;
			}
		});

		this.toggle = function (value) {
			current = value ? !!value : !current;

			console.log('ldToggle ' + $scope.$id);
			$timeout(function() {
				setter($scope, current);
			});
		};
	}])
	.directive('ldToggle', function () {
		return {
			restrict: 'A',
			controller: 'ldToggleController'
		};
	});
