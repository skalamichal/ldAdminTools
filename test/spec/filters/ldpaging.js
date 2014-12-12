'use strict';

describe('Filter: ldPaging', function () {

	// load the filter's module
	beforeEach(module('ldAdminTools'));

	// initialize a new instance of the filter before each test
	var ldPading;
	var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
	beforeEach(inject(function ($filter) {
		ldPading = $filter('ldPaging');
	}));

	it('should return return input if it is not an array', function () {
		var input = 'Michal';
		expect(ldPading(input)).toBe(input);
	});

	it('should return expected number of rows', function () {
		expect(ldPading(data, 1, 10).length).toEqual(10);
		expect(ldPading(data, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

		expect(ldPading(data, 5, 10).length).toEqual(0);

		expect(ldPading(data, 2, 13).length).toEqual(7);
		expect(ldPading(data, 2, 13)).toEqual([14, 15, 16, 17, 18, 19, 20]);
	});

});
