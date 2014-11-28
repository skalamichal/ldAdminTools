'use strict';

/**
 * @ngdoc service
 * @name ldAdminTools.ldMessageBox
 * @description
 * # ldMessageBox
 * Service in the ldAdminTools.
 *
 * Displays a message box overlay.
 */
angular.module('ldAdminTools')
	.service('ldMessageBoxService', ['$document', '$rootScope', '$compile', '$animate',
		function ldMessageBox($document, $rootScope, $compile, $animate) {

			var ON_CLASS = 'ld-message-box-on';
			var body = $document.find('body').eq(0);

			var messageElm;

			this.show = function (message, type, icon, spin) {
				var angularMessageElm = angular.element('<ld-message-box></ld-message-box>');
				angularMessageElm.attr({
					message: message,
					type: type,
					icon: icon,
					spin: spin
				});
				var scope = $rootScope.$new();

				messageElm = $compile(angularMessageElm)(scope);
				body.append(messageElm);
				$animate.addClass(body, ON_CLASS);
			};

			this.hide = function() {
				$animate.removeClass(body, ON_CLASS).then(function() {
					console.log('removed');
				});
			};

		}]);
