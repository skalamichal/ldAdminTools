'use strict';

/**
 * @ngdoc filter
 * @name ldAdminTools.filter:ldFilterMembers
 * @function
 * @description
 * # ldFilterMembers
 * Filter in the ldAdminTools.
 */
angular.module('ldAdminTools')
	.filter('ldFilterMembers', function () {
		function filterObject(obj, members) {
			var out = {};
			for (var i=0; i< members.length; i++) {
				var member = members[i];

				out[member] = obj[member];
			}

			return out;
		}

		function filterArray(arr, members) {
			var out = [];

			for (var i=0; i< arr.length; i++) {
				if (angular.isObject(arr[i])) {
					out.push(filterObject(arr[i], members));
				}
			}

			return out;
		}

		return function (input, members) {
			if (angular.isUndefined(members)) {
				return input;
			}

			// split the string to array
			var membersArray = members.split(/[ ]*[,][ ]*/);

			if (angular.isArray(input)) {
				return filterArray(input, membersArray);
			}
			else if (angular.isObject(input)) {
				return filterObject(input, membersArray);
			}
				else {
				return input;
			}
		};
	});
