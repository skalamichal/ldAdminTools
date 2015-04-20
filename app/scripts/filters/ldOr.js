/**
 * Created by Michal Skala on 20. 4. 2015.
 */

/*jslint node:true */
'use strict';

angular.module('ldAdminTools')
	.filter('ldOr', ['$filter', function ($filter) {

		var values;
		var field;

		function Comparator(_field, _values) {
			values = _values;
			field = _field;

			this.compare = function (value) {
				if (angular.isUndefined(value[field])) {
					return false;
				}

				console.log(value[field], (values.indexOf(value[field]) !== -1));

				return values.indexOf(value[field]) !== -1  ;
			}
		}

		return function(input, field, values) {
			if (!angular.isArray(input) || angular.isUndefined(field) || angular.isUndefined(values) || values.length === 0) {
				return input;
			}

			var comparator = new Comparator(field, values);

			return $filter('filter')(input, comparator.compare);
		}
	}]);