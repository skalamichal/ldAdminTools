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
 * - filters {Object} - values for the $filter('filter') filter, build in angular filter.
 * - orderBy {Array} - array of member used to sort the input array.
 * - ??custom - TODO
 */
angular.module('ldAdminTools')
	/*jshint unused:false*/
	.service('ldFilterService', ['$rootScope', '$filter', 'localStorageService', function ldFilterService($rootScope, $filter, localStorage) {

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
					filters[filterId] = {};
				}
				return filters[filterId];
			},

			/**
			 * Remove the stored filter
			 * @param filterId
			 */
			removeFilter: function(filterId) {
				delete filters[filterId];

				$rootScope.$broadcast(this.FILTER_REMOVED, filterId);
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

				var data = input;

				data = applyFilterFilter(data, filter.filter);
				data = applyOrderByFilter(data, filter.orderBy);

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

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			removeFilterFilterCriterion: function (filterId, criterion) {
				var filter = this.getFilter(filterId);

				// nothing to remove in this case
				if (angular.isUndefined(filter.filter)) {
					return;
				}

				// check if this is the global criterion and if, remove it, if equals
				if (angular.isString(criterion)) {
					delete filter.filter[criterion];
				}
				else if (angular.isArray(criterion)) {
					angular.forEach(criterion, function(key) {
						delete filter.filter[key];
					});
				}
				// loop through key,value pairs and remove them
				else if (angular.isObject(criterion)) {
					angular.forEach(criterion, function (value, key) {
						delete filter.filter[key];
					});
				}

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			clearFilterFilter: function (filterId) {
				var filter = this.getFilter(filterId);
				delete filter.filter;

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

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			clearOrderByFilter: function(filterId) {
				var filter = this.getFilter(filterId);
				delete filter.orderBy;

				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			forceUpdate: function(filterId) {
				var filter = this.getFilter(filterId);
				$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
			},

			forceUpdateAll: function() {
				angular.forEach(filters, function(filter, filterId) {
					$rootScope.$broadcast(this.FILTER_UPDATED, filterId, filter);
				}, this);
			},

			storeFilters: function() {
				if (localStorage.isSupported) {
					localStorage.set('filters', angular.toJson(filters));
				}
			},

			loadFilters: function() {
				if (localStorage.isSupported) {
					filters = angular.fromJson(localStorage.get('filters'));
				}
			}
		};
	}]);
