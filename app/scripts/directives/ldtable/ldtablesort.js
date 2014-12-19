'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldTableSort
 * @description
 * # ldTableSort
 * The ld-table-sort makes a binding between element and table column sorting. The value defines the
 * order by predicate.
 * Optionally you can use the ld-table-sort-default attribute with no value as a default ascent sorting or "reverse"
 * value for descent sorting.
 */
angular.module('ldAdminTools')
	.directive('ldTableSort', [function () {
		return {
			restrict: 'A',
			require: '^ldTable',
			link: function (scope, element, attrs, tableController) {
				if (angular.isUndefined(attrs.ldTableSort)) {
					return;
				}

				// default classes
				var ascentClass = 'ld-table-sort-ascent';
				var descentClass = 'ld-table-sort-descent';

				// order status enum
				var ORDER = Object.freeze({
					NONE: 0,
					ASCENT: 1,
					DESCENT: 2
				});

				var orderByField = attrs.ldTableSort;
				var order = ORDER.NONE;

				// udpate the order if the ld-table-sort-default attribute is set
				if (angular.isDefined(attrs.ldTableSortDefault)) {
					order = attrs.ldTableSortDefault === 'reverse' ? ORDER.DESCENT : ORDER.ASCENT;
				}

				/**
				 * Update the style based on the orderBy status
				 */
				function updateStyle() {
					element.removeClass(ascentClass).removeClass(descentClass);
					if (order === ORDER.ASCENT) {
						element.addClass(ascentClass);
					}
					else if (order === ORDER.DESCENT) {
						element.addClass(descentClass);
					}
				}

				/**
				 * Update element style and apply the orderBy filter.
				 */
				function sort() {
					updateStyle();
					if (order === ORDER.NONE) {
						tableController.clearOrderByFilter();
					}
					else {
						tableController.setOrderByFilter((order === ORDER.ASCENT ? '+' : '-') + orderByField, false);
					}
				}

				/**
				 * Change the order when the element is clicked
				 */
				function changeSortOrder() {
					order++;
					if (order > ORDER.DESCENT) {
						order = ORDER.NONE;
					}

					scope.$apply(sort);
				}

				function getOrder(orderBy) {
					var isCurrent = false;
					var isReversed = false;

					if (angular.isDefined(orderBy) && angular.isDefined(orderBy.values)) {
						// parse the array to find match
						angular.forEach(orderBy.values, function (value) {
							if (value.indexOf('-') >= 0 || value.indexOf('+') >= 0) {
								var sign = value.substr(0, 1);
								var field = value.substr(1);

								isReversed = (sign === '+') ? false : true;
								isCurrent = (field === orderByField);
							}
							else {
								isCurrent = (value === orderByField);
							}
						});
					}

					var order = ORDER.NONE;
					if (isCurrent) {
						if (isReversed) {
							order = ORDER.DESCENT;
						}
						else {
							order = ORDER.ASCENT
						}
					}

					return order;
				}

				// perform ordering updates when table is updated
				function tableUpdated() {
					var orderBy = tableController.getOrderByFilters();
					order = getOrder(orderBy);

					updateStyle();
				}

				// handle the TABLE_UPDATED event
				scope.$on(tableController.TABLE_UPDATED, tableUpdated);

				// bind the click handler to the element
				element.on('click', changeSortOrder);

				// unbind the click handler, when the element is removed
				// clean up!
				scope.$on('$destroy', function () {
					element.off('click', changeSortOrder);
				});

				// check if the order by is set in the current filter
				if (angular.isDefined(tableController.getOrderByFilters())) {
					order = getOrder(tableController.getOrderByFilters());
				}

				// initialize
				if (order !== ORDER.NONE) {
					sort();
				}
			}
		};
	}]);