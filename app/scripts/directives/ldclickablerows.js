'use strict';

/**
 * @ngdoc directive
 * @name ldAdminTools.directive:ldClickableRows
 * @description
 * # ldClickableRows
 * This directive is supposed to be used on tr elements and will enhance the enclosed
 * td elements with an ng-click directive. This is useful if you do not want to make
 * all columns clickable for some reason. Currently, it skips the columns containing
 * an input (checkbox, etc). Example usage: ld-clickable-rows="rowClicked(item)"
 * - this will result in ng-click="rowClicked(item)" being added to individual td
 * elements. It also adds ld-clickable css class to the TDs. By default, this class
 * sets the mouse cursor to "pointer".
 *
 * Optionally, you can also specify the ld-clickable-rows-active attribute to apply an
 * additional css class to the TDs besides ld-clickable. This is useful for displaying
 * "unread" items in an inbox-like list. Example usage:
 * ld-clickable-rows-active="{'ld-unread': !msg.read}"
 */
angular.module('ldAdminTools')
	.directive('ldClickableRows', ['$compile', function ($compile) {
		function link(scope, element, attrs) {
			angular.forEach(element.find('td'), function(value) {
				// avoid columns with input elements (such as checkboxes)
				// update all the others with a custom css class and an ng-click
				var tdElement = angular.element(value);
				if(tdElement.find('input').length === 0) {
					tdElement.addClass('ld-clickable').attr('ng-click', attrs.ldClickableRows);

					if(angular.isDefined(attrs.ldClickableRowsActive)) {
						tdElement.attr('ng-class', attrs.ldClickableRowsActive);
					}

					$compile(tdElement)(scope);
				}
			});
		}
		return {
			restrict: 'A',
			link: link
		};
	}]);
