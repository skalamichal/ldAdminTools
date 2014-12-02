'use strict';

describe('Filter: lfFrom', function () {

	// load the filter's module
	beforeEach(module('ldAdminTools'));

	// initialize a new instance of the filter before each test
	var ldFrom;
	var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	beforeEach(inject(function ($filter) {
		ldFrom = $filter('ldFrom');
	}));

	it('should return input, when input is not an array:"', function () {
		var input = 'Michal';
		expect(ldFrom(input)).toBe(input);
	});

	it('should return array from given index', function() {
		expect(ldFrom(data).length).toEqual(10);

		expect(ldFrom(data, 5).length).toEqual(5);
		expect(ldFrom(data, 8)).toEqual([9, 10]);
	});

});
