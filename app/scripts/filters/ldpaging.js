'use strict';

/**
 * @ngdoc filter
 * @name ldAdminTools.filter:ldPading
 * @function
 * @description
 * # ldPading
 * Filter in the ldAdminTools.
 * The ld-paging filters selects items from array based in paging (page number and page rows)
 */
angular.module('ldAdminTools')
	.filter('ldPaging', function () {
		return function (data, page, rowsPerPage) {
			if (!angular.isArray(data)) {
				return data;
			}

			var fromRow = (page - 1) * rowsPerPage;
			var toRow = fromRow + rowsPerPage;
			return data.slice(fromRow, toRow);
		};
	});
