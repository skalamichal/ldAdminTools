'use strict';

describe('Filter: ldSelect', function () {

	// load the filter's module
	beforeEach(module('ldAdminTools'));

	// initialize a new instance of the filter before each test
	var ldSelect;
	var data;
	beforeEach(inject(function ($filter) {
		ldSelect = $filter('ldSelect');

		data = [
			{
				firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com', age: 20
			},
			{
				firstname: 'Peter', lastname: 'Parker', email: 'peter.parker@example.com', age: 30
			},
			{
				firstname: 'Josh', lastname: 'Hutcherson', email: 'josh.hutch@example.com', age: 25
			},
			{
				firstname: 'Donald', lastname: 'Sutherland', email: 'donald.suther@example.com', age: 61
			},
			{
				firstname: 'Jennifer', lastname: 'Lawrence', email: 'jenny.lawrence@example.com', age: 26
			},
			{
				firstname: 'Willow', lastname: 'Shields', email: 'willow.shields@example.com', age: 16
			},
			{
				firstname: 'Will', lastname: 'Smith', email: 'will.smith@example.com', age: 20
			}
		];
	}));

	it('should return input if input is not an array, or if options are undefined', function () {
		var input = 'Michal';

		expect(ldSelect(input)).toBe(input);
		expect(ldSelect(data)).toEqual(data);
	});

	it('should return array where any field has the \'Will\' value', function () {
		var filter = {
			where: {
				$: 'Will'
			}
		};

		expect(ldSelect(data, filter)).toEqual([
			{
				firstname: 'Willow', lastname: 'Shields', email: 'willow.shields@example.com', age: 16
			},
			{
				firstname: 'Will', lastname: 'Smith', email: 'will.smith@example.com', age: 20
			}
		]);
	});

	it('should return array, where firstname contains \'Will\'', function () {
		var filter = {
			where: {
				firstname: 'Will'
			}
		};

		expect(ldSelect(data, filter)).toEqual([
			{
				firstname: 'Willow', lastname: 'Shields', email: 'willow.shields@example.com', age: 16
			},
			{
				firstname: 'Will', lastname: 'Smith', email: 'will.smith@example.com', age: 20
			}
		]);
	});

	it('should return array with property $ containing only the firstname and lastname', function () {
		var filter = {
			values: ['firstname', 'lastname']
		};

		var filtered = ldSelect(data, filter);

		filtered.forEach(function (item, index) {
			expect(item.$).toEqual({firstname: data[index].firstname, lastname: data[index].lastname});
		});
	});

	it('should return ordered array by age', function () {
		var filter = {
			order: {
				values: ['age']
			}
		};

		expect(ldSelect(data, filter)).toEqual([
			{
				firstname: 'Willow', lastname: 'Shields', email: 'willow.shields@example.com', age: 16
			},
			{
				firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com', age: 20
			},
			{
				firstname: 'Will', lastname: 'Smith', email: 'will.smith@example.com', age: 20
			},
			{
				firstname: 'Josh', lastname: 'Hutcherson', email: 'josh.hutch@example.com', age: 25
			},
			{
				firstname: 'Jennifer', lastname: 'Lawrence', email: 'jenny.lawrence@example.com', age: 26
			},
			{
				firstname: 'Peter', lastname: 'Parker', email: 'peter.parker@example.com', age: 30
			},
			{
				firstname: 'Donald', lastname: 'Sutherland', email: 'donald.suther@example.com', age: 61
			}
		]);
	});

	it('should return ordered and reversed array', function () {
		var filter = {
			order: {
				values: ['lastname', '-age'],
				reverse: true
			}
		};

		expect(ldSelect(data, filter)).toEqual([
			{
				firstname: 'Donald', lastname: 'Sutherland', email: 'donald.suther@example.com', age: 61
			},
			{
				firstname: 'Will', lastname: 'Smith', email: 'will.smith@example.com', age: 20
			},
			{
				firstname: 'Willow', lastname: 'Shields', email: 'willow.shields@example.com', age: 16
			},
			{
				firstname: 'Peter', lastname: 'Parker', email: 'peter.parker@example.com', age: 30
			},
			{
				firstname: 'Jennifer', lastname: 'Lawrence', email: 'jenny.lawrence@example.com', age: 26
			},
			{
				firstname: 'Josh', lastname: 'Hutcherson', email: 'josh.hutch@example.com', age: 25
			},
			{
				firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com', age: 20
			}
		]);
	});

	it('should return first 3 items, ordered by lastname', function () {
		var filter = {
			order: {
				values: ['lastname']
			},
			limit: 3,
			from: 0
		};

		expect(ldSelect(data, filter)).toEqual([
			{
				firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com', age: 20
			},
			{
				firstname: 'Josh', lastname: 'Hutcherson', email: 'josh.hutch@example.com', age: 25
			},
			{
				firstname: 'Jennifer', lastname: 'Lawrence', email: 'jenny.lawrence@example.com', age: 26
			}
		]);
	});

});
