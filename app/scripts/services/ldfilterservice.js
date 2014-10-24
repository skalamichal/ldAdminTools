'use strict';

/**
 * @ngdoc service
 * @name ldAdminTools.ldFilterService
 * @description
 * # ldFilterService
 * Service in the ldAdminTools.
 */
angular.module('ldAdminTools')
	.service('ldFilterService', ['$filter', function ldFilterService($filter) {

		// filters are stored in named array
		var filterFilter = $filter('filter');
		var orderbyFilter = $filter('orderBy');
		return {
			getFilter: function (filterId) {
				return allfilters[filterId];
			},

			applyFilter: function (input, filter) {
				if (!angular.isArray(input)) {
					return input;
				}

				var data = input;

				if (angular.isDefined(filter.filters)) {
					console.log(filter.filters);
					data = filterFilter(data, filter.filters);
					console.log(data);
				}

				if (angular.isDefined(filter.orderby)) {
					data = orderbyFilter(data, filter.orderby);
				}

				return data;
			}
		};
	}]);
