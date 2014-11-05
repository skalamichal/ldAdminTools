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
	.service('ldCache', function ldCache() {
		var cached = [];

		this.cache = function (key, data) {
			cached[key] = data;
		};

		this.get = function (key) {
			return cached[key];
		};

		this.clear = function (key) {
			if (angular.isDefined(key)) {
				var index = cached.indexOf(key);
				if (index > 0) {
					cached.splice(index, 1);
				}
			}
			// clear all
			else {
				cached.splice(0, cached.length);
			}
		};
	});
