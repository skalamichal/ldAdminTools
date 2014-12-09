'use strict';

describe('Directive: ldResize', function () {

	// load the directive's module
	var windowMock;
	beforeEach(module('ldAdminTools', function ($provide) {
		windowMock = {
			innerWidth: 800,
			innerHeight: 600,
			setSize: function(width, height) {
				windowMock.innerWidth = width;
				windowMock.innerHeight = height;
			},
			bind: jasmine.createSpy('bind'),
			addEventListener: jasmine.createSpy('addEventListener')
		};

		$provide.value('$window', windowMock);
	}));

	var $scope,
		$window,
		$compile,
		$rootScope;

	beforeEach(inject(function (_$rootScope_, _$window_, _$compile_) {
		$rootScope = _$rootScope_;
		$scope = _$rootScope_.$new();
		$window = _$window_;
		$compile = _$compile_;
	}));

	it('should call resize method, when window is resized', function () {
		$rootScope.onResize = jasmine.createSpy('onResize');
		$compile('<div ld-resize="onResize"></div>')($scope);
		$rootScope.$digest();

		$window.setSize(300,200);
		$rootScope.$digest();

		$scope.updateSize();
		$rootScope.$digest();

		expect($rootScope.onResize).toHaveBeenCalledWith(300, 200);
	});

});
