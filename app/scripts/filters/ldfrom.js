'use strict';

/**
 * @ngdoc filter
 * @name ldAdminTools.filter:lfFrom
 * @function
 * @description
 * # lfFrom
 * Filter in the ldAdminTools.
 *
 * Returns data from index.
 */
angular.module('ldAdminTools')
	.filter('ldFrom', function () {
		return function (input, fromIndex) {
			if (!angular.isArray(input)) {
				return input;
			}

			var fromIdx = fromIndex || 0;

			return input.slice(fromIdx);
		};
	});
