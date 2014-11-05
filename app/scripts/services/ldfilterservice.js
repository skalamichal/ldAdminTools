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
 * - filters {Object} - values for the $filter('filter') filter, build in angular filter.
 * - orderBy {Array} - array of member used to sort the input array.
 * - cache {Array} - cached filtered collection to be used in views with last filter results
 * - ??custom - TODO
 */
angular.module('ldAdminTools')
	/*jshint unused:false*/
	.factory('ldFilterService', ['$rootScope', '$filter', 'localStorageService', function ldFilterService($rootScope, $filter, localStorage) {

		// filters are stored in named array
		var filterFilter = $filter('filter');
		var orderByFilter = $filter('orderBy');

		// filters object, each filter is stored by it's name
		var filters = {};

		/**
		 * Apply the $filter('filter') filter
		 * @param data
		 * @param filter
		 * @returns {Array} - filtered or original array
		 */
		function applyFilterFilter(data, filter) {
			if (angular.isUndefined(filter)) {
				return data;
			}

			return filterFilter(data, filter);
		}

		/**
		 * Apply the $filter('orderBy') filter
		 * @param data
		 * @param orderBy
		 * @returns {Array} - filtered or original array
		 */
		function applyOrderByFilter(data, orderBy) {
			if (angular.isUndefined(orderBy)) {
				return data;
			}

			return orderByFilter(data, orderBy.criterion, orderBy.reverse);
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

			var filtered = applyFilterFilter(data, preset.filters);
			return applyOrderByFilter(filtered, preset.orderBy);
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
				data = applyFilterFilter(data, filter.filter);
				data = applyOrderByFilter(data, filter.orderBy);

				filter.dirty = false;

				return data;
			},

			/**
			 * Ads search criterion to existing search criteria
			 * @param filterId
			 * @param criterion
			 */
			addFilterFilterCriterion: function (filterId, criterion) {
				var filter = this.getFilter(filterId);
				if (angular.isUndefined(filter.filter)) {
					filter.filter = {};
				}

				// if string, it a global search, change it to {$:criterion}
				if (angular.isString(criterion)) {
					angular.extend(filter.filter, {$: criterion});
				}
				// if is an object, just extend it
				else if (angular.isObject(criterion)) {
					angular.extend(filter.filter, criterion);
				}

				filter.dirty = true;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			removeFilterFilterCriterion: function (filterId, criterion) {
				var filter = this.getFilter(filterId);

				// nothing to remove in this case
				if (angular.isUndefined(filter.filter)) {
					return;
				}

				// string should represent one property, remove it
				if (angular.isString(criterion)) {
					delete filter.filter[criterion];
				}
				else if (angular.isArray(criterion)) {
					angular.forEach(criterion, function (key) {
						delete filter.filter[key];
					});
				}
				// loop through key,value pairs and remove them
				else if (angular.isObject(criterion)) {
					angular.forEach(criterion, function (value, key) {
						delete filter.filter[key];
					});
				}

				filter.dirty = true;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			clearFilterFilter: function (filterId) {
				var filter = this.getFilter(filterId);
				delete filter.filter;

				filter.dirty = true;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			addOrderByFilterCriterion: function (filterId, criterion, reverse) {
				var filter = this.getFilter(filterId);
				var rev = !!reverse;

				if (angular.isUndefined(filter.orderBy)) {
					filter.orderBy = {};
				}

				if (angular.isString(criterion)) {
					filter.orderBy = {
						criterion: criterion,
						reverse: rev
					};
				}

				filter.dirty = true;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			removeOrderByFilterCriterion: function (filterId, criterion) {
				var filter = this.getFilter(filterId);

				if (angular.isUndefined(filter)) {
					return;
				}

				if (angular.isString(criterion)) {
					filter.orderBy = {};
				}

				filter.dirty = true;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			clearOrderByFilter: function (filterId) {
				var filter = this.getFilter(filterId);
				delete filter.orderBy;

				filter.dirty = true;

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

			setDirty: function(filterId) {
				this.getFilter(filterId).dirty = true;
			},

			isDirty: function(filterId) {
				return !!this.getFilter(filterId).dirty;
			},

			storeFilters: function () {
				if (localStorage.isSupported) {
					var store = {};
					angular.forEach(filters, function (value, key) {
						store[key] = {
							preset: value.preset,
							filter: value.filter,
							orderBy: value.orderBy
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
						filters[key].filter = value.filter;
						filters[key].orderBy = value.orderBy;
						filters[key].dirty = true;
					});
				}
			}
		};
	}]);
