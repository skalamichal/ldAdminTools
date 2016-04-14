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
 * - dirty {Boolean} - filter is updated, data needs to be updated
 * - presets {Array} - list of preset filters
 * - where {Object} - values for the $filter('filter') filter, build in angular filter.
 * - order {Array} - array of member used to sort the input array.
 *
 * - preset {Object} - currently selected filter from presets
 * - data   {Object} - filter data, which are set outside of the preset filter (custom)
 *
 * - combined {Object} - combined filter data from preset and data
 *
 * The filter service is using the ldSelect filter, which is sql select like filter.
 */
angular.module('ldAdminTools')
	/*jshint unused:false*/
	.factory('ldFilterService', ['$rootScope', '$filter', '$log', 'localStorageService',
		function ldFilterService($rootScope, $filter, $log, localStorage) {

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

			/**
			 * Logs the filter to console as:
			 * ldSelect values(fields) where (field=value) order by (fields) asc|desc
			 * @param filterData
			 */
			function logFilter(filterData) {
				if (angular.isUndefined(filterData)) {
					return;
				}

				var str = 'ldSelect ';

				if (angular.isDefined(filterData.values)) {
					str += 'values(';
					if (angular.isString(filterData.values)) {
						str += filterData.values;
					}
					else if (angular.isArray(filterData.values)) {
						str += filterData.values.toString();
					}
					str += ') ';
				}

				if (angular.isDefined(filterData.where)) {
					str += 'where (';
					angular.forEach(filterData.where, function (value, key) {
						str += key + ' = ' + value + ' ';
					});
					str += ') ';
				}

				if (angular.isDefined(filterData.order) && angular.isDefined(filterData.order.values) &&
					angular.isDefined(filterData.order.reverse)) {
					str += 'order by (';
					str += filterData.order.values.toString();
					str += filterData.order.reverse ? ') desc ' : ') asc ';
				}

				$log.debug(str);

			}

			/**
			 * Combines the preset filter with the custom filter data.
			 * @param filter
			 */
			function combine(filter) {
				var combined = angular.isDefined(filter.preset) ? angular.copy(filter.preset) : {};
				var source = filter.data;

				if (angular.isDefined(source)) {
					// merge where conditions
					if (angular.isDefined(source.where)) {
						combined.where = angular.isDefined(combined.where) ? angular.extend(combined.where, source.where) : source.where;
					}

					// merge order condition (just overwrite in this case)
					if (angular.isDefined(source.order)) {
						combined.order = source.order;
					}

					// merge the or condition (just overwrite in this case)
					if (angular.isDefined(source.or)) {
						combined.or = source.or;
					}
				}

				filter.combined = combined;
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
					var filter = filters[filterId];
					if (angular.isUndefined(filter)) {
						filter = {
							dirty: false,
							data: {},
							combined: {},
							presets: [],
							preset: undefined
						};

						filters[filterId] = filter;
					}
					return filter;
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
					filter.presets = angular.merge(filter.presets, list);
				},

				/**
				 * Set filter from registered list, if no presets are defined, store this one as preset and return it
				 * @param filterId
				 * @param presetId
				 */
				setPreset: function (filterId, presetId) {
					var filter = this.getFilter(filterId);
					if (angular.isUndefined(filter.presets)) {
						filter.presets = [filter];
					}

					var preset = getPreset(filter.presets, presetId);
					if (preset === null) {
						return null;
					}

					filter.preset = preset;
					filter.dirty = true;

					combine(filter);

					$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
				},

				/**
				 * Get the selected preset from the list
				 * @param filterId
				 */
				getPreset: function (filterId) {
					var filter = this.getFilter(filterId);
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
					filter.dirty = true;

					combine(filter);

					$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
				},

				/**
				 * Set the preset marked as default in the list.
				 * @param filterId
				 */
				setDefaultPreset: function (filterId) {
					var filter = this.getFilter(filterId);
					if (angular.isUndefined(filter.presets)) {
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

					combine(filter);

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

					var data = applyFilter(input, filter.combined);

					filter.dirty = false;

					return data;
				},

				/**
				 * Look for undefined or empty values in the where object.
				 * @param where {object}
				 */
				cleanUpWhereConditions: function (where) {
					var keys = [];
					// remove empty values
					angular.forEach(where, function (val, key) {
						if (angular.isUndefined(val) || val.length === 0) {
							keys.push(key);
						}
					});

					angular.forEach(keys, function (key) {
						delete where[key];
					});

					return where;
				},

				/**
				 * Set the filter.data.where condition.
				 * @param filterId
				 * @param whereConds condition could be one of:
				 * - string value - which will set it for global (every available field) search
				 * - object value - with field:value pairs
				 * If the value is undefined or empty, it will be removed from the where condition
				 */
				setWhereCondition: function (filterId, whereConds) {
					var filter = this.getFilter(filterId);
					var whereConditions = filter.data.where;
					if (angular.isUndefined(whereConditions)) {
						whereConditions = {};
					}

					// just string, update the where for global search, for all available fields, in angular marked as $
					if (angular.isString(whereConds)) {
						whereConditions = angular.extend(whereConditions, {$: whereConds});
					}
					// object of field:value pairs
					else if (angular.isObject(whereConds)) {
						whereConditions = angular.extend(whereConditions, whereConds);
					}

					whereConditions = this.cleanUpWhereConditions(whereConditions);

					// mark filter as dirty and fire event
					filter.dirty = true;
					filter.data.where = whereConditions;
					combine(filter);

					$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
				},

				/**
				 * Remove the field from where condition
				 * @param filterId
				 * @param fields may be oen of following:
				 * - string - remove the field
				 * - array - remove all fields
				 */
				removeWhereCondition: function (filterId, fields) {
					var filter = this.getFilter(filterId);
					var whereConditions = filter.data.where;
					if (angular.isUndefined(whereConditions)) {
						return;
					}

					if (angular.isString(fields)) {
						delete whereConditions[fields];
					}
					else if (angular.isArray(fields)) {
						angular.forEach(fields, function (key) {
							delete whereConditions[key];
						});
					}

					filter.dirty = true;
					filter.data.where = whereConditions;
					combine(filter);

					$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
				},

				/**
				 * Remove where conditions from the filter
				 * @param filterId
				 */
				clearWhereFilter: function (filterId) {
					var filter = this.getFilter(filterId);
					delete filter.data.where;

					filter.dirty = true;
					combine(filter);

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
					var orderConditions;

					if (angular.isString(fields)) {
						orderConditions = {
							values: [fields],
							reverse: rev
						};
					}
					else if (angular.isArray(fields)) {
						orderConditions = {
							values: fields,
							reverse: rev
						};
					}

					filter.dirty = true;
					filter.data.order = orderConditions;

					combine(filter);

					$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
				},

				clearOrderByFilter: function (filterId) {
					var filter = this.getFilter(filterId);
					delete filter.data.order;

					filter.dirty = true;
					combine(filter);

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
								data: value.data
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
							filters[key].data = value.data;
							combine(filters[key]);
							filters[key].dirty = true;
						});
					}
				},

				/**
				 * Return all registered filters
				 * @return filters
				 */
				getFilters: function() {
					return filters;
				},

				/**
				 * Output filter definition
				 * @param filterId
				 */
				toString: function (filterId) {
					var filter = this.getFilter(filterId);
					if (angular.isUndefined(filter)) {
						return;
					}

					logFilter(filter.combined);
				}
			};
		}]);
