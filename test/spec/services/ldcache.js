'use strict';

describe('Service: ldCache', function () {

	// load the service's module
	var mock;
	beforeEach(module('ldAdminTools', function ($provide) {
		mock = {
			data: {},
			isSupported: true,
			set: jasmine.createSpy('set').andCallFake(function (key, value) {
				mock.data[key] = value;
			}),
			get: jasmine.createSpy('get').andCallFake(function (key) {
				return mock.data[key];
			}),
			remove: jasmine.createSpy('remove').andCallFake(function (key) {
				delete mock.data[key];
			}),
			keys: jasmine.createSpy('keys').andCallFake(function () {
				var ks = [];
				angular.forEach(mock.data, function (data, key) {
					ks.push(key);
				});
				return ks;
			})
		};

		$provide.value('localStorageService', mock);
	}));

	// instantiate service
	var ldCache;
	beforeEach(inject(function (_ldCache_) {
		ldCache = _ldCache_;
	}));

	it('should add value to the cache and store to local storage', function () {
		ldCache.cache('name', 'michal');
		expect(mock.set).toHaveBeenCalled();
		expect(mock.set).toHaveBeenCalledWith('ldCache_name', 'michal');
	});

	it('should read value from the cache', function () {
		ldCache.cache('name', 'michal');
		var value = ldCache.get('name');

		expect(value).toBe('michal');
		// it's in cache, don't call localstorage
		expect(mock.get).not.toHaveBeenCalled();
	});

	it('should remove value from cache', function () {
		ldCache.cache('name', 'michal');
		ldCache.clear('name');

		expect(mock.remove).toHaveBeenCalledWith('ldCache_name');

		var value = ldCache.get('name');
		expect(value).toBeUndefined();
		expect(mock.get).toHaveBeenCalledWith('ldCache_name');
	});

	it('should clear all values from cache', function () {
		ldCache.cache('firstname', 'michal');
		ldCache.cache('lastname', 'smith');

		ldCache.clear();
		expect(mock.remove).toHaveBeenCalledWith('ldCache_firstname');
		expect(mock.remove).toHaveBeenCalledWith('ldCache_lastname');
		expect(ldCache.get('firstname')).toBeUndefined();
		expect(ldCache.get('lastname')).toBeUndefined();
	});

	it('should load value from localstorage', function () {
		mock.data.ldCache_name = 'michal';

		var name = ldCache.get('name');
		expect(mock.get).toHaveBeenCalledWith('ldCache_name');
		expect(name).toBe('michal');
	});
});