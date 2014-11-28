'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldMessageBox
 * @description
 * # ldMessageBox
 */
angular.module('ldAdminTools')
	.constant('ldMessageBoxConfig', {
		'icon': '',
		'spin': false,
		'message': 'enter message',
		'type': 'default',
		'opened': true
	})
	.directive('ldMessageBox', ['$parse', 'ldMessageBoxConfig', function ($parse, config) {
		return {
			templateUrl: 'partials/ldmessagebox.html',
			restrict: 'EA',
			replace: true,
			scope: {
				message: '@?',
				spin: '=?',
				type: '@?',
				icon: '@?'
			},
			link: function postLink(scope, element, attrs) {
				scope.message = angular.isUndefined(scope.message) ? config.message : scope.message;
				scope.spin = scope.spin || config.spin;
				scope.icon = angular.isUndefined(scope.icon) ? config.icon : scope.icon;
				scope.type = angular.isUndefined(scope.type) ? config.type : scope.type;
			}
		};
	}]);
