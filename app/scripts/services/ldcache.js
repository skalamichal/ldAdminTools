'use strict';

/**
 * @ngdoc service
 * @name ldAdminToolsApp.ldCache
 * @description
 * # ldCache
 * Service in the ldAdminToolsApp.
 * Simple cache service
 */
angular.module('ldAdminTools')
	.constant('ldCacheConfig', {
		limit: 10,
		useLocalStorage: true,
		prefix: 'ldCache_'
	})
	.service('ldCache', ['ldCacheConfig', 'localStorageService', function ldCache(config, localStorage) {
		// cache storage
		var cached = {};

		// the prefix for local storage keys
		var prefix = config.prefix;

		/**
		 * Read entry from local storage by the key
		 * @param key
		 * @returns {*}
		 */
		function readFromLocalStorage(key) {
			if (localStorage.isSupported) {
				return localStorage.get(prefix + key);
			}
		}

		/**
		 * Remove entry from the local storage
		 * @param key
		 */
		function removeFromLocalStorage(key) {
			if (localStorage.isSupported) {
				localStorage.remove(prefix + key);
			}
		}

		/**
		 * Write entry to the local storage.
		 * @param key
		 * @param data
		 */
		function writeToLocalStorage(key, data) {
			if (localStorage.isSupported) {
				localStorage.set(prefix + key, data);
			}
		}

		/**
		 * Clear all cached entries from the local storage
		 */
		function removeAllFromLocalStorage() {
			if (localStorage.isSupported) {
				var keys = localStorage.keys();
				angular.forEach(keys, function (key) {
					if (key.indexOf(prefix) !== -1) {
						localStorage.remove(key);
					}
				});
			}
		}

		this.cache = function (key, data) {
			cached[key] = data;
			writeToLocalStorage(key, data);
		};

		this.get = function (key) {
			if (angular.isUndefined(cached[key])) {
				// look in localStorage
				cached[key] = readFromLocalStorage(key);
			}
			return cached[key];
		};

		this.clear = function (key) {
			if (angular.isDefined(key) && angular.isDefined(cached[key])) {
				delete cached[key];
				removeFromLocalStorage(key);
			}
			// clear all
			else {
				removeAllFromLocalStorage();
				cached = {};
			}
		};
	}]);
