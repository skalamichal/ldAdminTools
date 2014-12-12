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
	.service('ldMessageBox', ['$document', '$rootScope', '$compile',
		function ldMessageBox($document, $rootScope, $compile) {

			var ON_CLASS = 'ld-message-box-on';
			var body = $document.find('body').eq(0);

			var messageElm;

			this.show = function (message, type, icon, spin) {
				if (angular.isDefined(messageElm)) {
					this.hide();
				}

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
				body.addClass(ON_CLASS);
			};

			this.hide = function () {
				body.removeClass(ON_CLASS);
				messageElm.remove();
			};

		}]);
