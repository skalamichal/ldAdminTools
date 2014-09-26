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
