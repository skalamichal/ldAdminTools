'use strict';

describe('Directive: ldDataNavigation', function () {

	var $element,
		$scope,
		$compile,
		ldDataNavigationConfig,
		scope,
		$location; // mock

	beforeEach(module('ldAdminTools', function($provide) {
		$location = {
			url: jasmine.createSpy('url')
		};

		$provide.factory('$location', function() {
			return $location;
		});
	}));

	function createIds() {
		return [1, 12, 13, 34, 45, 76, 87, 88, 90, 110, 111, 312, 413, 414, 515, 616];
	}

	function prepareMessage(pattern, index, total) {
		var message = pattern.replace('{0}', index);
		return message.replace('{1}', total);
	}

	function getPrevious() {
		return $element.find('a').eq(0);
	}

	function getNext() {
		return $element.find('a').eq(1);
	}

	function compileWithCurrent(current) {
		$scope.data = createIds();
		$scope.current = current;
		var element = angular.element('<ld-data-navigation data="data" current-id="current" view-url="/url/{0}" filter="All items"></ld-data-navigation>');
		$element = $compile(element)($scope);
		$scope.$digest();

		scope = $element.isolateScope();
	}

	beforeEach(inject(function (_$rootScope_, _ldDataNavigationConfig_, _$compile_) {
		$scope = _$rootScope_.$new();
		ldDataNavigationConfig = _ldDataNavigationConfig_;
		$compile = _$compile_;
	}));

	it('should make hidden element visible', function () {
		compileWithCurrent(88);

		expect(scope.currentIndex).toBe(7);
		expect(scope.showPreviousButton).toBeTruthy();
		expect(scope.showNextButton).toBeTruthy();

		var message = prepareMessage(ldDataNavigationConfig.messageDefault, scope.currentIndex + 1, $scope.data.length);
		expect(scope.message).toBe(message);

		expect($element.text().trim()).toBe('All items: ' + message);
		expect($element.find('a').length).toBe(2);

		var previous = getPrevious();
		expect(previous.hasClass('disabled')).toBeFalsy();
		var next = getNext();
		expect(next.hasClass('disabled')).toBeFalsy();
	});

	describe('should enable/disable navigation buttons', function () {

		it('should disable previous button', function () {
			compileWithCurrent(1);
			var previous = getPrevious();
			expect(previous).toHaveClass('disabled');
		});

		it('should disable next button', function() {
			compileWithCurrent(616);
			var next = getNext();
			expect(next).toHaveClass('disabled');
		});

		it('should navigate to previous page', function() {
			compileWithCurrent(12);
			var previous = getPrevious();
			expect(previous).not.toHaveClass('disabled');

			scope.previousEntry();
			$scope.$digest();

			expect(scope.index).toBe(0);
			expect($location.url).toHaveBeenCalledWith('/url/1');
		});

		it('should navigate to next page', function() {
			compileWithCurrent(515);
			var next = getNext();
			expect(next).not.toHaveClass('disabled');

			scope.nextEntry();
			$scope.$digest();

			expect(scope.index).toBe($scope.data.length - 1);
			expect($location.url).toHaveBeenCalledWith('/url/616');
		});

	});
});
