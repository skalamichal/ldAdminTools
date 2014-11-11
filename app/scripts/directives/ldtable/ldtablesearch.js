'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTableSearch
 * @description
 * # ldTableSearch
 * The ld-table-search makes a binding between input field and table filter.
 * The ld-table-search can be set to filter specific properties on objects in array. If no value is set any property
 * of the object is tested for match.
 * The ng-model is required to set.

 */
angular.module('ldAdminTools')
	.directive('ldTableSearch', ['$timeout', '$parse', function ($timeout, $parse) {
		return {
			restrict: 'A',
			require: ['^ldTable', 'ngModel'],
			link: function (scope, element, attrs, controllers) {
				var tableController = controllers[0];
				var modelController = controllers[1];
				var promise;

				var predicateGet = $parse(attrs.ldTableSearch);
				var predicate;

				// watch the predicate value so we can change filter at runtime
				scope.$watch(predicateGet, function (newValue, oldValue) {
					if (newValue !== oldValue) {
						predicate = newValue;
						tableController.removeSearchFilter(oldValue);
						tableController.setSearchFilter(modelController.$viewValue || '', predicate);
					}
				});

				// method called when the content of ng-model is changed
				// it's using the $timeout service, so we don't update the filter at every change
				function inputChanged() {
					if (promise !== null) {
						$timeout.cancel(promise);
					}

					promise = $timeout(function () {
						tableController.setSearchFilter(modelController.$viewValue || '', predicate);
						promise = null;
					}, 200);
				}

				// watch for the input changes
				scope.$watch(function() {
					return modelController.$viewValue
				}, inputChanged);
			}
		};
	}])