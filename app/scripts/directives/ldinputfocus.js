'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldInputFocus
 * @description
 * # ldInputFocus
 */
angular.module('ldAdminTools')
	.directive('ldInputFocus', ['$parse', '$timeout', function ($parse, $timeout) {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs) {
				var property = attrs.ldInputFocus;
				var isFocus = $parse(property);
				scope.$watch(isFocus, function (newValue) {
					if (!!newValue) {
						$timeout(function () {
							element[0].focus();
						});
					}
				});
			}
		};
	}]);
