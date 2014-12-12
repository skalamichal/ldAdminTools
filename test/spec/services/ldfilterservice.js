'use strict';

describe('Service: ldFilterService', function () {

	// load the service's module
	beforeEach(module('ldAdminTools', function ($provide) {
		var mock = {
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
	var ldFilterService,
		data,
		presets;

	beforeEach(inject(function (_ldFilterService_) {
		ldFilterService = _ldFilterService_;

		presets = {
			'test': [
				{
					'id': 1,
					'name': 'All Data',
					'default': true
				},
				{
					'id': 2,
					'name': 'First has J',
					'where': {
						'firstname': 'J'
					},
					'values': ['firstname', 'lastname'],
					'columnsAs': ['First Name', 'Last Name']
				},
				{
					'id': 3,
					'name': 'Order By Age',
					'order': {
						values: 'age'
					}
				},
				{
					'id': 4,
					'name': 'First has J and order by Age',
					'where': {
						'firstname': 'J'
					},
					order: {
						values: 'age'
					}
				},
			]
		};

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

	it('should register presets, set default presets, apply to data and clear preset', function () {
		ldFilterService.registerPresets('test', presets.test);
		var filter = ldFilterService.getFilter('test');
		expect(filter.dirty).toBeFalsy();
		expect(filter.presets).toBeDefined();
		expect(filter.presets.length).toBe(presets.test.length);
		expect(filter.preset).toBeUndefined();
		expect(filter.dirty).toBeFalsy();

		ldFilterService.setDefaultPreset('test');
		var preset = ldFilterService.getPreset('test');
		expect(filter.preset).toBeDefined();
		expect(filter.preset).toEqual(presets.test[0]);
		expect(filter.preset).toEqual(preset);
		expect(filter.dirty).toBeTruthy();

		var result = ldFilterService.applyFilter('test', data);
		expect(filter.dirty).toBeFalsy();
		expect(result).toEqual(data);

		ldFilterService.clearPreset('test');
		expect(filter.dirty).toBeTruthy();
		expect(filter.preset).toBeUndefined();
	});

	it('should apply another preset and filter data', function () {
		ldFilterService.registerPresets('test', presets.test);
		ldFilterService.setPreset('test', 2);
		var filter = ldFilterService.getFilter('test');
		expect(filter.preset).toBeDefined();
		expect(filter.preset).toEqual(presets.test[1]);
		expect(filter.dirty).toBeTruthy();

		var result = ldFilterService.applyFilter('test', data);
		expect(filter.dirty).toBeFalsy();
		expect(result).toEqual([
			{
				firstname: 'John',
				lastname: 'Doe',
				email: 'john.doe@example.com',
				age: 20,
				$: {firstname: 'John', lastname: 'Doe'}
			},
			{
				firstname: 'Josh',
				lastname: 'Hutcherson',
				email: 'josh.hutch@example.com',
				age: 25,
				$: {firstname: 'Josh', lastname: 'Hutcherson'}
			},
			{
				firstname: 'Jennifer',
				lastname: 'Lawrence',
				email: 'jenny.lawrence@example.com',
				age: 26,
				$: {firstname: 'Jennifer', lastname: 'Lawrence'}
			}
		]);
	});

	it('should set global search', function () {
		ldFilterService.setWhereCondition('test', 'Will');
		var filter = ldFilterService.getFilter('test');
		expect(filter.dirty).toBeTruthy();
		expect(filter.data.where.$).toBe('Will');
		expect(ldFilterService.applyFilter('test', data)).toEqual([
			{
				firstname: 'Willow', lastname: 'Shields', email: 'willow.shields@example.com', age: 16
			},
			{
				firstname: 'Will', lastname: 'Smith', email: 'will.smith@example.com', age: 20
			}
		]);

		ldFilterService.removeWhereCondition('test', '$');
		expect(filter.dirty).toBeTruthy();
		expect(filter.data.where.$).toBeUndefined();
	});

	it('should defined global search via object', function () {
		ldFilterService.setWhereCondition('test', {$: 'Will'});
		var filter = ldFilterService.getFilter('test');
		expect(filter.dirty).toBeTruthy();
		expect(filter.data.where.$).toBe('Will');
		expect(ldFilterService.applyFilter('test', data)).toEqual([
			{
				firstname: 'Willow', lastname: 'Shields', email: 'willow.shields@example.com', age: 16
			},
			{
				firstname: 'Will', lastname: 'Smith', email: 'will.smith@example.com', age: 20
			}
		]);

		ldFilterService.removeWhereCondition('test', '$');
		expect(filter.dirty).toBeTruthy();
		expect(filter.data.where.$).toBeUndefined();
	});

	it('should set search via object and remove via array', function () {
		ldFilterService.setWhereCondition('test', {firstname: 'Will', age: 26, $: 'Smith'});
		var filter = ldFilterService.getFilter('test');
		expect(filter.dirty).toBeTruthy();
		expect(filter.data.where).toEqual({
			firstname: 'Will',
			age: 26,
			$: 'Smith'
		});

		ldFilterService.removeWhereCondition('test', ['$']);
		expect(filter.data.where).toEqual({
			firstname: 'Will',
			age: 26
		});

		ldFilterService.removeWhereCondition('test', ['age', 'firstname']);
		expect(filter.data.where).toEqual({});

		ldFilterService.clearWhereFilter('test');
		expect(filter.data.where).toBeUndefined();
	});

	it('should define ordering options, apply and remove it', function () {
		ldFilterService.setOrderByCondition('test', 'age', false);
		var filter = ldFilterService.getFilter('test');
		expect(filter.dirty).toBeTruthy();
		expect(filter.data.order).toEqual({
			values: ['age'],
			reverse: false
		});
		expect(ldFilterService.applyFilter('test', data)).toEqual([
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

		ldFilterService.clearOrderByFilter('test');
		expect(filter.dirty).toBeTruthy();
		expect(filter.data.order).toBeUndefined();
	});

	it('should combine preset and custom filter options', function () {
		ldFilterService.registerPresets('test', presets.test);

		var filter = ldFilterService.getFilter('test');
		expect(filter.combined).toEqual({});

		ldFilterService.setDefaultPreset('test');
		expect(filter.combined).toEqual(presets.test[0]);

		ldFilterService.setPreset('test', 2);
		expect(filter.combined).toEqual(presets.test[1]);

		ldFilterService.setWhereCondition('test', 'Will');
		expect(filter.combined).toEqual({
			'id': 2,
			'name': 'First has J',
			'where': {
				'firstname': 'J',
				$: 'Will'
			},
			'values': ['firstname', 'lastname'],
			'columnsAs': ['First Name', 'Last Name']
		});

		ldFilterService.setOrderByCondition('test', '-age', true);
		expect(filter.combined).toEqual({
			'id': 2,
			'name': 'First has J',
			'where': {
				'firstname': 'J',
				$: 'Will'
			},
			'order': {
				values: ['-age'],
				reverse: true
			},
			'values': ['firstname', 'lastname'],
			'columnsAs': ['First Name', 'Last Name']
		});

		ldFilterService.clearWhereFilter('test');
		ldFilterService.clearOrderByFilter('test');
		expect(filter.combined).toEqual(presets.test[1]);

		// order by in preset should be overridden by custom condition
		ldFilterService.setPreset('test', 3);
		ldFilterService.setWhereCondition('test', 'Will');
		ldFilterService.setOrderByCondition('test', 'firstname', false);
		expect(filter.combined).toEqual({
			'id': 3,
			'name': 'Order By Age',
			'order': {
				values: ['firstname'],
				reverse: false
			},
			'where': {
				$: 'Will'
			}
		});

		ldFilterService.clearWhereFilter('test');
		ldFilterService.clearOrderByFilter('test');
		expect(filter.combined).toEqual(presets.test[2]);

		// order by should be overridden by custom filter and where should overridden (firstname) and extended with age
		ldFilterService.setPreset('test', 4);
		ldFilterService.setWhereCondition('test', {firstname: 'Will', age: 16});
		ldFilterService.setOrderByCondition('test', ['firstname', 'lastname'], true);
		expect(filter.combined).toEqual({
			'id': 4,
			'name': 'First has J and order by Age',
			'where': {
				'firstname': 'Will',
				'age': 16
			},
			order: {
				values: ['firstname', 'lastname'],
				reverse: true
			}
		});

	});

});
