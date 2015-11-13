'use strict';

describe('Directive: ldDashboardBox', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var $element,
		$rootScope,
		$compile,
		$scope,
		config;

	beforeEach(inject(function (_$rootScope_, _$compile_, _ldDashboardBoxConfig_) {
		$rootScope = _$rootScope_.$new();
		$compile = _$compile_;
		config = _ldDashboardBoxConfig_;

		$rootScope.onToggle = jasmine.createSpy('onToggle');
		$rootScope.onClose = jasmine.createSpy('onClose');
	}));

	describe('create default ldDashboardBox', function() {

		beforeEach(function() {
			var element = angular.element('<ld-dashboard-box>box content</ld-dashboard-box>');
			$element = $compile(element)($rootScope);

			$rootScope.$digest();
			$scope = $element.isolateScope();
		});

		it('should create default element', function() {
			expect($scope.panelType).toBe(config.panelTypeDefault);
			expect($scope.isBoxOpen).toBeTruthy();

			expect($element).toHaveClass('panel-default');

			var header = $element.find('div').eq(0);
			expect(header.find('h4').eq(0).text().trim()).toBe('');
			expect(header.find('button').eq(0)).toHaveClass('btn-default');

			var content = $element.children().eq(1);
			expect(content.text().trim()).toBe('box content');
		});

		it('should toggle visibility, but not call method on the scope', function() {
			expect($scope.ldOnToggle).toBeUndefined();

			$scope.toggle();

			expect($scope.isBoxOpen).toBeFalsy();
			expect($rootScope.onToggle).not.toHaveBeenCalled();

			$scope.toggle();

			expect($scope.isBoxOpen).toBeTruthy();
			expect($rootScope.onToggle).not.toHaveBeenCalled();
		});

		it('should close/ remove the element, but not call the method on the scope', function() {
			spyOn($element, 'remove');
			$scope.$apply(function() {
				$scope.close();
			});

			expect($rootScope.onClose).not.toHaveBeenCalled();
		});
	});

	describe('create with custom attributes', function() {

		beforeEach(function() {
			var element = angular.element('<ld-dashboard-box ld-on-close="onClose" ld-on-toggle="onToggle" ld-title="Test" ld-size="half" ld-type="error">box content</ld-dashboard-box>');
			$element = $compile(element)($rootScope);

			$rootScope.$digest();
			$scope = $element.isolateScope();
		});

		it('should create the element', function() {
			expect($scope.panelType).toBe('error');
			expect($scope.isBoxOpen).toBeTruthy();

			expect($element).toHaveClass('panel-error');

			var header = $element.find('div').eq(0);
			expect(header.find('h4').eq(0).text().trim()).toBe('Test');
			expect(header.find('button').eq(0)).toHaveClass('btn-error');

			var content = $element.children().eq(1);
			expect(content.text().trim()).toBe('box content');
		});

		it('should toggle visibility and call method on the scope', function() {
			$scope.$apply(function() {
				$scope.toggle();
			});
			$rootScope.$digest();

			expect($scope.isBoxOpen).toBeFalsy();
			expect($rootScope.onToggle).toHaveBeenCalledWith(false);

			$scope.$apply(function() {
				$scope.toggle();
			});
			$rootScope.$digest();

			expect($scope.isBoxOpen).toBeTruthy();
			expect($rootScope.onToggle).toHaveBeenCalledWith(true);
		});

		it('should close/ remove the element and call the method on the scope', function() {
			spyOn($element, 'remove');
			$scope.$apply(function() {
				$scope.close();
			});

			expect($rootScope.onClose).toHaveBeenCalled();
		});

	});
});
