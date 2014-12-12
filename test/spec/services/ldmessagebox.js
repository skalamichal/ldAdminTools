'use strict';

describe('Service: $ldMessageBox', function () {

	// load the service's module
	beforeEach(module('ldAdminTools'));

	// instantiate service
	var ldMessageBox,
		$document,
		$scope,
		body;

	beforeEach(inject(function (_ldMessageBox_, _$document_, _$rootScope_) {
		ldMessageBox = _ldMessageBox_;
		$document = _$document_;
		$scope = _$rootScope_.$new();
		body = $document.find('body').eq(0);
	}));

	it('should have the class defined on the body, when the message is displayed', function () {
		expect(body).not.toBeUndefined();
		expect(body.hasClass('ld-message-box-on')).toBeFalsy();

		ldMessageBox.show();
		$scope.$digest();

		expect(body.hasClass('ld-message-box-on')).toBeTruthy();

		ldMessageBox.hide();
		$scope.$digest();

		expect(body.hasClass('ld-message-box-on')).toBeFalsy();
	});

	it('should show only one message', function () {
		var messages = body.find('div');
		expect(messages.length).toBe(0);

		ldMessageBox.show();
		$scope.$digest();
		ldMessageBox.show();
		$scope.$digest();
		messages = body.find('div');
		var count = 0;
		angular.forEach(messages, function (message) {
			if (angular.element(message).hasClass('ld-message-box')) {
				count++;
			}
		});
		expect(count).toBe(1);
	});

});
