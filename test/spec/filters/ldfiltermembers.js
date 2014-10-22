'use strict';

describe('Filter: ldFilterMembers', function () {

	// load the filter's module
	beforeEach(module('ldAdminTools'));

	// initialize a new instance of the filter before each test
	var ldFilterMembers;
	var dataObj;
	var dataArray;

	function randomUser() {
		var fnames = ['Michal', 'John', 'George', 'Jones', 'Arnold', 'Dean'];
		var lnames = ['Doe', 'Smith', 'Rambo', 'Black', 'White'];
		var cities = ['New York', 'Los Angeles', 'San Francisco', 'Las Vegas', 'Atlanta'];
		var streets = ['1st Avenue', '2nd Avenue', '3rd Avenue', '4th Avenue'];

		var fname = fnames[Math.floor(Math.random() * fnames.length)];
		var lname = lnames[Math.floor(Math.random() * lnames.length)];
		var city = cities[Math.floor(Math.random() * cities.length)];
		var street = streets[Math.floor(Math.random() * streets.length)];

		return {
			firstName: fname,
			lastName: lname,
			email: fname.toLowerCase() + '@' + lname.toLowerCase() + '.com',
			city: city,
			street: street
		};
	}

	function createArray() {
		var items = [];
		for (var i=0; i< 10; i++) {
			items.push(randomUser());
		}

		return items;
	}

	beforeEach(inject(function ($filter) {
		ldFilterMembers = $filter('ldFilterMembers');

		dataObj = randomUser();
		dataArray = createArray();
	}));

	it('should return the same object', function () {
		expect(dataObj).toEqual(ldFilterMembers(dataObj));
	});

	it('should return filtered object with only first and last name:', function () {
		var filtered = ldFilterMembers(dataObj, 'firstName,lastName');

		expect(dataObj).toNotEqual(filtered);
		expect(filtered.firstName).toBeDefined();
		expect(filtered.lastName).toBeDefined();
		expect(filtered.email).toBeUndefined();
		expect(filtered.city).toBeUndefined();
		expect(filtered.street).toBeUndefined();

		expect(filtered.firstName).toEqual(dataObj.firstName);
		expect(filtered.lastName).toEqual(dataObj.lastName);
	});

	it('should return the same array'), function() {
		var filtered = ldFilterMembers(dataArray);

		expect(filtered.length).toBe(dataArray.length);
		for (var i=0; i< filtered.length; i++) {
			expect(filtered[i]).toEqual(dataArray[i]);
		}
	};

	it('should return filtered array with only first and last names', function() {
		var filtered = ldFilterMembers(dataArray, 'firstName, lastName');

		expect(dataArray.length).toBe(filtered.length);
		for (var i=0; i< filtered.length; i++) {
			expect(filtered[i].firstName).toBeDefined();
			expect(filtered[i].lastName).toBeDefined();
			expect(filtered[i].email).toBeUndefined();
			expect(filtered[i].city).toBeUndefined();
			expect(filtered[i].street).toBeUndefined();

			expect(filtered[i].firstName).toEqual(dataArray[i].firstName);
			expect(filtered[i].lastName).toEqual(dataArray[i].lastName);
		}
	});

});
