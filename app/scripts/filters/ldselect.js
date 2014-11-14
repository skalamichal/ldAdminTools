'use strict';

/**
 * @ngdoc filter
 * @name ldAdminToolsApp.filter:ldSelect
 * @function
 * @description
 * # ldSelect
 * Filter in the ldAdminToolsApp.
 * Selects data from collection based on select options data.
 */
angular.module('ldAdminTools')
	.filter('ldSelect', ['$filter', function ($filter) {

		/**
		 * Return new object with properties defined in the values array
		 * @param {Object} obj
		 * @param {Array} values
		 * @returns {{}}
		 */
		function selectValues(obj, values) {
			var out = {};
			angular.forEach(values, function (key) {
				out[key] = obj[key];
			})

			return out;
		}

		/**
		 * Create new objects array where only defined values are selected.
		 * @param {Array} input
		 * @param {Array} values
		 * @returns {*}
		 */
		function values(input, values) {
			if (angular.isUndefined(values)) {
				return input;
			}

			var out = [];

			angular.forEach(input, function (row) {
				if (angular.isObject(row)) {
					out.push(selectValues(row, values));
				}
			});

			return out;
		}

		/**
		 * Return filtered array
		 * @param input
		 * @param where
		 * @returns {*}
		 */
		function where(input, where) {
			if (angular.isUndefined(where)) {
				return input;
			}

			var filter = $filter('filter');
			return filter(input, where);
		}

		/**
		 * Return ordered array.
		 * @param input
		 * @param orderBy
		 * @returns {*}
		 */
		function order(input, orderBy) {
			if (angular.isUndefined(order)) {
				return input;
			}

			var filter = $filter('orderBy');
			return filter(input, orderBy);
		}

		/**
		 * Return limitTo from array
		 * @param input
		 * @param limit
		 */
		function limit(input, limit) {
			if (angular.isUndefined(limit)) {
				return input
			}

			var filter = $filter('limitTo');
			return filter(input, limit);
		}

		return function (input, options) {
			if (!angular.isArray(input)) {
				return input;
			}

			var copy = where(input, options.where);
			copy = order(copy, options.order);
			copy = limit(copy, options.limit);
			copy = values(copy, options.values);

			return copy;
		};
	}]);
