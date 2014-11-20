'use strict';

/**
 * @ngdoc service
 * @name ldAdminTools.ldFilterService
 * @description
 * # ldFilterService
 * Service in the ldAdminTools.
 *
 * The ldFilterService stores filters across different pages
 * Each filter is an object with following values:
 * - dirty {Boolean} - filter updated, data need to be updated
 * - presets {Array} - list of preset filters
 * - preset {Object} - currently selected preset
 * - where {Object} - values for the $filter('filter') filter, build in angular filter.
 * - order {Array} - array of member used to sort the input array.
 */
angular.module('ldAdminTools')
	/*jshint unused:false*/
	.factory('ldFilterService', ['$rootScope', '$filter', 'localStorageService', function ldFilterService($rootScope, $filter, localStorage) {

		// filters are stored in named array
		var ldSelectFilter = $filter('ldSelect');

		// filters object, each filter is stored by it's name
		var filters = {};

		function applyFilter(data, filter) {
			if (angular.isUndefined(filter)) {
				return data;
			}

			return ldSelectFilter(data, filter);
		}

		/**
		 * Apply the preset filter, which is object with filters and orderBy data.
		 * @param data
		 * @param preset
		 */
		function applyPresetFilter(data, preset) {
			if (angular.isUndefined(preset)) {
				return data;
			}

			return applyFilter(data, preset);
		}

		/**
		 * Return preset filter from the list of registered (preset) filters.
		 * @param presets
		 * @param id
		 * @returns {*}
		 */
		function getPreset(presets, id) {
			for (var i = 0; i < presets.length; i++) {
				if (presets[i].id === id) {
					return presets[i];
				}
			}

			return null;
		}

		return {

			FILTER_REMOVED: 'ldFilterRemoved',
			FILTER_UPDATED: 'ldFilterUpdated',

			/**
			 * Get the filter from stored filters or create new filter
			 * @param filterId
			 * @returns {*}
			 */
			getFilter: function (filterId) {
				if (angular.isUndefined(filters[filterId])) {
					filters[filterId] = {dirty: false};
				}
				return filters[filterId];
			},

			/**
			 * Remove the stored filter
			 * @param filterId
			 */
			removeFilter: function (filterId) {
				delete filters[filterId];

				$rootScope.$broadcast(this.FILTER_REMOVED, filterId);
			},

			/**
			 * Register filters which could be used for filter.
			 * @param filterId
			 * @param list
			 */
			registerPresets: function (filterId, list) {
				var filter = this.getFilter(filterId);
				filter.presets = list;
			},

			/**
			 * Set filter from registered list
			 * @param filterId
			 * @param presetId
			 */
			setPreset: function (filterId, presetId) {
				var filter = this.getFilter(filterId);
				if (angular.isUndefined(filter.presets)) {
					return;
				}

				var preset = getPreset(filter.presets, presetId);
				if (preset === null) {
					return;
				}

				filter.preset = preset;
				filter.dirty = true;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			/**
			 * Get the selected preset from the list
			 * @param filterId
			 */
			getPreset: function (filterId) {
				var filter = this.getFilter(filterId);
				if (angular.isUndefined(filter)) {
					return;
				}

				return filter.preset;
			},

			/**
			 * Clear the preset filter.
			 * @param filterId
			 */
			clearPreset: function (filterId) {
				var filter = this.getFilter(filterId);
				if (angular.isUndefined(filter)) {
					return;
				}
				filter.preset = undefined;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			/**
			 * Set the preset marked as default in the list.
			 * @param filterId
			 */
			setDefaultPreset: function (filterId) {
				var filter = this.getFilter(filterId);
				if (angular.isUndefined(filter) || angular.isUndefined(filter.presets)) {
					return;
				}

				var presets = filter.presets;
				for (var i = 0; i < presets.length; i++) {
					if (presets[i].default) {
						filter.preset = presets[i];
						filter.dirty = true;
						break;
					}
				}

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			/**
			 * Apply the filter
			 * @param filterId - filter to apply
			 * @param input {Array}
			 * @returns {Array} - filtered array
			 */
			applyFilter: function (filterId, input) {
				if (!angular.isArray(input)) {
					return input;
				}

				var filter = this.getFilter(filterId);

				if (!filter.dirty) {
					return input;
				}

				var data = input;

				data = applyPresetFilter(data, filter.preset);
				data = applyFilter(data, filter);

				filter.dirty = false;

				return data;
			},

			/**
			 * Look for undefined or empty values in the where object.
			 * @param where
			 */
			cleanUpWhereConditions: function(filter) {
				var keys = [];
				// remove empty values
				angular.forEach(filter.where, function(val, key) {
					if (angular.isUndefined(val) || val.length === 0) {
						keys.push(key);
					}
				});

				angular.forEach(keys, function(key) {
					delete filter.where[key];
				});
			},

			/**
			 * Set the filter.where condition.
			 * @param filterId
			 * @param where condition could be one of:
			 * - string value - which will set it for global (every available field) search
			 * - object value - with field:value pairs
			 * If the value is undefined or empty, it will be removed from the where condition
			 */
			setWhereCondition: function (filterId, where) {
				var filter = this.getFilter(filterId);
				if (angular.isUndefined(filter.where)) {
					filter.where = {};
				}

				// just string, update the where for global search, for all available fields, in angular marked as $
				if (angular.isString(where)) {
					angular.extend(filter.where, {$: where});
				}
				// object of field:value pairs
				else if (angular.isObject(where)) {
					angular.extend(filter.where, where);
				}

				this.cleanUpWhereConditions(filter);

				// mark filter as dirty and fire event
				filter.dirty = true;
				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			/**
			 * Remove the field from where condition
			 * @param filterId
			 * @param where may be oen of following:
			 * - string - remove the field
			 * - array - remove all fields
			 */
			removeWhereCondition: function(filterId, where) {
				var filter = this.getFilter(filterId);
				if (angular.isUndefined(filter.where)) {
					return;
				}

				if (angular.isString(where)) {
					delete filter.where[where];
				}
				else if (angular.isArray(where)) {
					angular.forEach(where, function(key) {
						delete filter.where[key];
					});
				}

				filter.dirty = true;
				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			clearWhereFilter: function(filterId) {
				var filter = this.getFilter(filterId);
				delete filter.where;

				filter.dirty = true;
				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			/**
			 * Set the ordering.
			 * @param filterId
			 * @param fields - {String} order by the string value
			 *               - {Array} order by strings in Array
			 * @param reverse - reverse the order of array
			 */
			setOrderByCondition: function (filterId, fields, reverse) {
				var filter = this.getFilter(filterId);
				var rev = !!reverse;

				if (angular.isUndefined(filter.order)) {
					filter.order = {};
				}

				if (angular.isUndefined(fields) || fields.length === 0) {
					delete filter.order;
				}
				else if (angular.isString(fields) || angular.isArray(fields)) {
					filter.order = {
						values: fields,
						reverse: rev
					};
				}

				filter.dirty = true;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			clearOrderByFilter: function (filterId) {
				var filter = this.getFilter(filterId);
				delete filter.order;

				filter.dirty = true;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			updateFilter: function (filterId, inputFilter) {
				var filter = this.getFilter(filterId);

				angular.extend(filter, inputFilter);
				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			forceUpdate: function (filterId) {
				var filter = this.getFilter(filterId);
				filter.dirty = true;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			forceUpdateAll: function () {
				angular.forEach(filters, function (filter, filterId) {
					filter.dirty = true;
					$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
				}, this);
			},

			setDirty: function (filterId) {
				this.getFilter(filterId).dirty = true;
			},

			isDirty: function (filterId) {
				return !!this.getFilter(filterId).dirty;
			},

			storeFilters: function () {
				if (localStorage.isSupported) {
					var store = {};
					angular.forEach(filters, function (value, key) {
						store[key] = {
							preset: value.preset,
							where: value.where,
							order: value.order
						};
					});
					localStorage.set('filters', angular.toJson(store));
				}
			},

			loadFilters: function () {
				if (localStorage.isSupported) {
					var loaded = angular.fromJson(localStorage.get('filters'));

					if (angular.isDefined(loaded) && loaded === null) {
						loaded = {};
					}

					angular.forEach(loaded, function (value, key) {
						filters[key].preset = value.preset;
						filters[key].where = value.where;
						filters[key].order = value.order;
						filters[key].dirty = true;
					});
				}
			}
		};
	}]);
