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

				var criterion = attrs.ldTableSort;
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
					if (order === ORDER.NONE) {
						tableController.clearOrderByFilter();
					}
					else {
						tableController.setOrderByFilter((order === ORDER.ASCENT ? '+' : '-') + criterion, false);
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

				scope.$on(tableController.TABLE_UPDATED, function () {
					var orderBy = tableController.getOrderByFilters();

					var isCurrent = false;
					var isReversed = false;

					if (angular.isDefined(orderBy) && angular.isDefined(orderBy.values)) {
						// parse the array to find match
						angular.forEach(orderBy.values, function (value) {
							if (value.indexOf('-') >= 0 || value.indexOf('+') >= 0) {
								var sign = value.substr(0, 1);
								var field = value.substr(1);

								console.log(sign + ' ' + field);

								isReversed = (sign === '+') ? false : true;
								isCurrent = (field === criterion);
							}
							else {
								isCurrent = (value === criterion);
							}
						});
					}

					console.log(isCurrent + ' ' + isReversed);

					order = ORDER.NONE;
					if (isCurrent) {
						if (isReversed) {
							order = ORDER.DESCENT;
						}
						else {
							order = ORDER.ASCENT
						}
					}

					console.log(order);

					updateStyle();
				});

				// bind the click handler to the element
				element.on('click', changeSortOrder);

				// unbind the click handler, when the element is removed
				// clean up!
				scope.$on('$destroy', function () {
					element.off('click', changeSortOrder);
				});

				// initialize
				if (order !== ORDER.NONE) {
					sort();
				}
			}
		};
	}])