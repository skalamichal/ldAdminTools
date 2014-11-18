'use strict';

/**
 * @ngdoc filter
 * @name ldAdminToolsApp.filter:ldSelect
 * @function
 * @description
 * # ldSelect
 * Filter in the ldAdminToolsApp.
 * Selects data from collection based on select options data (in this order):
 * {
 *  where: {
 *      field: value
 *  },
 *  order: 'field' or ['+field', '-field', ...],
 *  from: index
 *  limit: number,
 *  values: ['field', ...]
 * }
 *
 * If values are defined the new array has full copy of the input collection, but a new field named '$' is added with
 * filtered values. This allows to use the filter with ng-repeat for eaxmple.
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
			obj.$ = {};
			angular.forEach(values, function (key) {
				obj.$[key] = obj[key];
			});

			return obj;
		}

		/**
		 * Create new objects array where only defined values are selected.
		 * @param {Array} input
		 * @param {Array} vals
		 * @returns {*}
		 */
		function values(input, vals) {
			if (angular.isUndefined(vals)) {
				return input;
			}

			var out = [];

			angular.forEach(input, function (row) {
				if (angular.isObject(row)) {
					out.push(selectValues(row, vals));
				}
			});

			return out;
		}

		/**
		 * Return filtered array
		 * @param input
		 * @param whre
		 * @returns {*}
		 */
		function where(input, whre) {
			if (angular.isUndefined(whre)) {
				return input;
			}

			var filter = $filter('filter');
			return filter(input, whre);
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
		 * @param lmit
		 */
		function limit(input, lmit) {
			if (angular.isUndefined(lmit)) {
				return input;
			}

			var filter = $filter('limitTo');
			return filter(input, lmit);
		}

		/**
		 * Return ldFrom from array
		 * @param input
		 * @param fromIndex
		 * @returns {*}
		 */
		function from(input, fromIndex) {
			if (angular.isUndefined(fromIndex)) {
				return input;
			}

			var filter = $filter('ldFrom');
			return filter(input, fromIndex);
		}

		return function (input, options) {
			if (!angular.isArray(input)) {
				return input;
			}

			var copy = where(input, options.where);
			copy = order(copy, options.order);
			copy = from(copy, options.from);
			copy = limit(copy, options.limit);
			copy = values(copy, options.values);

			return copy;
		};
	}]);
