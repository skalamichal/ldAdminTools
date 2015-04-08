'use strict';

describe('Directive: ldExpandableInput', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var $element,
		$scope;

	beforeEach(inject(function (_$rootScope_) {
		$scope = _$rootScope_.$new();

		$scope.onClear = jasmine.createSpy('onClear');
		$scope.onOpen = jasmine.createSpy('onOpen');
		$scope.onClose = jasmine.createSpy('onClose');
	}));

	it('should create default directive HTML code', inject(function ($compile) {
		var element = angular.element('<ld-expandable-input ng-model="value"></ld-expandable-input>');
		$element = $compile(element)($scope);
		$scope.$digest();

		var elmScope = $element.isolateScope();

		expect($element.find('div').eq(0).hasClass('ld-expandable-input')).toBeTruthy();
		expect(elmScope.opened).toBeFalsy();
		// the close div is not available, so we should have only two divs
		expect($element.find('div').length).toBe(2);

		// get the second div, with two buttons + input field
		var inputContent = $element.find('div').eq(1);
		expect(inputContent.hasClass('ld-input-group')).toBeTruthy();
		expect(inputContent.children().length).toBe(3);

		var button = inputContent.children().eq(0);
		expect(button.hasClass('ld-input-group-btn')).toBeTruthy();
		expect(button.hasClass('relative')).toBeTruthy();
		expect(button.css('cursor')).toBe('pointer');
		expect(elmScope.iconLeft).toBe('fa-toggle-on');

		var buttonIcon = inputContent.find('i').eq(0);
		expect(buttonIcon.hasClass('fa fa-fw fa-toggle-on fa-lg')).toBeTruthy();

		var input = inputContent.children().eq(1);
		expect(input.hasClass('ld-form-control')).toBeTruthy();
		expect(input.attr('placeholder')).toBe('Enter value...');
		expect(input.hasClass('ng-hide')).toBeTruthy();

		var buttonRight = inputContent.children().eq(2);
		expect(elmScope.iconRight).toBe('fa-remove');
		expect(buttonRight.hasClass('ng-hide')).toBeTruthy();

		var buttonIconRight = inputContent.find('i').eq(1);
		expect(buttonIconRight.hasClass('fa fa-fw fa-remove fa-lg')).toBeTruthy();
	}));

	it('should create default directive HTML code when in opened state', inject(function ($compile) {
		$scope.opened = true;
		var element = angular.element('<ld-expandable-input ng-model="value" opened="opened"></ld-expandable-input>');
		$element = $compile(element)($scope);
		$scope.$digest();

		var elmScope = $element.isolateScope();

		expect(elmScope.opened).toBeTruthy();
		expect($element.find('div').length).toBe(3);

		// get the second div, with two buttons + input field
		var inputContent = $element.find('div').eq(1);
		expect(inputContent.hasClass('ld-input-group')).toBeTruthy();
		expect(inputContent.children().length).toBe(3);

		var button = inputContent.children().eq(0);
		expect(button.hasClass('ld-input-group-btn')).toBeTruthy();
		expect(button.hasClass('relative')).toBeFalsy();
		expect(button.css('cursor')).toBe('context-menu');
		expect(elmScope.iconLeft).toBe('fa-toggle-off');

		var buttonIcon = inputContent.find('i').eq(0);
		expect(buttonIcon.hasClass('fa fa-fw fa-toggle-off fa-lg')).toBeTruthy();

		var input = inputContent.children().eq(1);
		expect(input.hasClass('ld-form-control')).toBeTruthy();
		expect(input.attr('placeholder')).toBe('Enter value...');
		expect(input.hasClass('ng-hide')).toBeFalsy();

		var buttonRight = inputContent.children().eq(2);
		expect(elmScope.iconRight).toBe('fa-remove');
		expect(buttonRight.hasClass('ng-hide')).toBeTruthy();

		var buttonIconRight = inputContent.find('i').eq(1);
		expect(buttonIconRight.hasClass('fa fa-fw fa-remove fa-lg')).toBeTruthy();

		var close = $element.find('div').eq(2);
		expect(close).toBeDefined();
		expect(close.find('a').eq(0).text()).toBe('Close');
	}));

	it('should change when opened is set to true and back to false', inject(function ($compile) {
		$scope.opened = false;
		var element = angular.element('<ld-expandable-input ng-model="value" opened="opened"></ld-expandable-input>');
		$element = $compile(element)($scope);
		$scope.$digest();

		var elmScope = $element.isolateScope();

		expect(elmScope.opened).toBeFalsy();
		expect($element.find('div').length).toBe(2);

		$scope.opened = true;
		$scope.$digest();

		expect(elmScope.opened).toBeTruthy();
		expect($element.find('div').length).toBe(3);
		expect(elmScope.isFocus).toBeTruthy();

		// call close method as if we click the close button
		elmScope.close();
		$scope.$digest();

		expect(elmScope.opened).toBeFalsy();
		expect(elmScope.isFocus).toBeFalsy();
		expect($element.find('div').length).toBe(2);

		// click open
		elmScope.open();
		$scope.$digest();
		expect(elmScope.opened).toBeTruthy();
		expect($element.find('div').length).toBe(3);
		expect(elmScope.isFocus).toBeTruthy();
	}));

	it('should update clear icon when input field has any text', inject(function ($compile) {
		$scope.opened = false;
		var element = angular.element('<ld-expandable-input ng-model="value" opened="opened"></ld-expandable-input>');
		$element = $compile(element)($scope);
		$scope.$digest();

		var elmScope = $element.isolateScope();

		$scope.value = 'Michal';
		$scope.$digest();

		var input = $element.find('input').eq(0);
		expect(input[0].value).toBe('Michal');
		expect(input.hasClass('ng-hide')).toBeTruthy();

		elmScope.open();
		$scope.$digest();

		expect(input[0].value).toBe('Michal');
		expect(elmScope.isFocus).toBeTruthy();

		var clearButton = $element.find('span').eq(1);
		expect(clearButton.hasClass('ng-hide')).toBeFalsy();

		$scope.value = '';
		$scope.$digest();
		expect(clearButton.hasClass('ng-hide')).toBeTruthy();

		$scope.value = 'Michal';
		$scope.$digest();
		expect(clearButton.hasClass('ng-hide')).toBeFalsy();
		// click clear button

		elmScope.clear();
		$scope.$digest();
		expect(clearButton.hasClass('ng-hide')).toBeTruthy();
		expect(input[0].value).toBe('');
	}));

	it('should call callback methods', inject(function ($compile) {
		$scope.opened = false;
		var element = angular.element('<ld-expandable-input ng-model="value" opened="opened" on-clear="onClear" on-open="onOpen" on-close="onClose"></ld-expandable-input>');
		$element = $compile(element)($scope);
		$scope.$digest();

		var elmScope = $element.isolateScope();

		elmScope.open();
		$scope.$digest();
		expect($scope.onOpen).toHaveBeenCalled();
		elmScope.clear();
		$scope.$digest();
		expect($scope.onClear).toHaveBeenCalled();
		elmScope.close();
		$scope.$digest();
		expect($scope.onClose).toHaveBeenCalled();
	}));

	it('should add custom icons/placeholder/value/close text', inject(function ($compile) {
		$scope.opened = false;
		$scope.placeholder = 'Custom placeholder';
		$scope.closeText = 'Custom close';
		$scope.openIcon = 'open-icon';
		$scope.closeIcon = 'close-icon';
		$scope.clearIcon = 'clear-icon';
		var element = angular.element('<ld-expandable-input ng-model="value" placeholder="{{placeholder}}" close-text="{{closeText}}" open-icon="{{openIcon}}" close-icon="{{closeIcon}}" clear-icon="{{clearIcon}}"></ld-expandable-input>');
		$element = $compile(element)($scope);
		$scope.$digest();

		var elmScope = $element.isolateScope();

		expect(elmScope.iconLeft).toBe('open-icon');

		var buttonIcon = $element.find('i').eq(0);
		expect(buttonIcon.hasClass('fa fa-fw open-icon fa-lg')).toBeTruthy();

		var input = $element.find('input').eq(0);
		expect(input.attr('placeholder')).toBe('Custom placeholder');

		expect(elmScope.iconRight).toBe('clear-icon');

		var buttonIconRight = $element.find('i').eq(1);
		expect(buttonIconRight.hasClass('fa fa-fw clear-icon fa-lg')).toBeTruthy();

		// open and check
		elmScope.open();
		$scope.$digest();
		expect(elmScope.iconLeft).toBe('close-icon');
		expect(buttonIcon.hasClass('fa fa-fw fa-lg close-icon')).toBeTruthy();

		// check custom cancel
		expect($element.find('a').eq(0).text()).toBe('Custom close');
	}));
});
