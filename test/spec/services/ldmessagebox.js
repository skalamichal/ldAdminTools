'use strict';

describe('Service: $ldMessageBox', function () {

	// load the service's module
	beforeEach(module('ldAdminTools'));

	// instantiate service
	var ldMessageBox,
		$document,
		$scope;

	beforeEach(inject(function (_ldMessageBox_, _$document_, _$rootScope_) {
		ldMessageBox = _ldMessageBox_;
		$document = _$document_;
		$scope = _$rootScope_.$new();
	}));

	it('should have the class defined on the body, when the message is displayed', function() {
		var body = $document.find('body').eq(0);
		expect(body).not.toBeUndefined();
		expect(body.hasClass('ld-message-box-on')).toBeFalsy();

		ldMessageBox.show();
		$scope.$digest();

		expect(body.hasClass('ld-message-box-on')).toBeTruthy();

		ldMessageBox.hide();
		$scope.$digest();

		expect(body.hasClass('ld-message-box-on')).toBeFalsy();
	});

});
