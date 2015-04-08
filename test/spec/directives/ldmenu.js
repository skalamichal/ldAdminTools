'use strict';
/*jshint camelcase:false */

describe('Directive: ldMenu', function () {

	// load the directive's module
	beforeEach(module('ldAdminTools'));

	var $rootScope;
	var unreadFn;

	beforeEach(inject(function (_$rootScope_) {
		$rootScope = _$rootScope_.$new();
		$rootScope.unread = 5;
		unreadFn = jasmine.createSpy('unreadFn').andCallFake(function () {
			return $rootScope.unread;
		});
	}));

	function createMenu() {
		return [
			{
				'url': '#/menu1',
				'icon': 'fa-menu1',
				'text': 'Menu 1'
			},
			{
				'url': '#/menu2',
				'icon': 'fa-menu2',
				'text': 'Menu 2',
				'badge': unreadFn
			},
			{
				'url': '',
				'icon': 'fa-submenu',
				'text': 'Menu 3',
				'submenu': [
					{
						'url': '#/submenu1',
						'text': 'Submenu 1'
					},
					{
						'url': '#/submenu2',
						'text': 'Submenu 2'
					},
					{
						'url': '#/submenu3',
						'text': 'Submenu 3'
					}
				]
			}
		];
	}

	describe('ldSidebarMenuController', function () {
		function __createMenu(level) {
			var menuScope = $rootScope.$new();
			menuScope.level = level;
			menuScope.closeMenu = jasmine.createSpy('closeMenu');

			return menuScope;
		}

		var ctrl;

		beforeEach(inject(function ($controller) {
			ctrl = $controller('ldSidebarMenuController', {});
		}));

		it('should return string for values 1, 2, 3', function () {
			expect(ctrl.getLevelAsString(1)).toBe('first');
			expect(ctrl.getLevelAsString(2)).toBe('second');
			expect(ctrl.getLevelAsString(3)).toBe('third');
			expect(ctrl.getLevelAsString()).toBe('');
		});

		it('should check registerMenu', function () {
			var menuLevel1_1 = __createMenu(1);
			var menuLevel1_2 = __createMenu(1);
			var menuLevel1_3 = __createMenu(1);
			var menuLevel2_1 = __createMenu(2);
			var menuLevel2_2 = __createMenu(2);
			var menuLevel2_3 = __createMenu(2);

			spyOn(ctrl, 'getLevelAsString').andCallThrough();

			expect(ctrl.menus.length).toBe(0);

			ctrl.registerMenu(menuLevel1_1);
			expect(ctrl.menus[1]).toBeDefined();
			expect(ctrl.menus[1].length).toBe(1);
			expect(ctrl.getLevelAsString).toHaveBeenCalledWith(1);
			expect(menuLevel1_1.menuLevelStyle).toBe('nav-first-level');
			ctrl.registerMenu(menuLevel1_2);
			expect(ctrl.menus[1].length).toBe(2);
			ctrl.registerMenu(menuLevel1_3);
			expect(ctrl.menus[1].length).toBe(3);
			expect(ctrl.menus[2]).toBeUndefined();

			ctrl.registerMenu(menuLevel2_1);
			expect(ctrl.menus[2]).toBeDefined();
			expect(ctrl.menus[2].length).toBe(1);
			expect(ctrl.getLevelAsString).toHaveBeenCalledWith(2);
			expect(menuLevel2_1.menuLevelStyle).toBe('nav-second-level');
			ctrl.registerMenu(menuLevel2_2);
			ctrl.registerMenu(menuLevel2_3);
			expect(ctrl.menus[2].length).toBe(3);
		});

		it('should open and close menu', function () {
			var menuLevel1_1 = __createMenu(1);
			var menuLevel1_2 = __createMenu(1);
			var menuLevel1_3 = __createMenu(1);
			var menuLevel2_1 = __createMenu(2);
			var menuLevel2_2 = __createMenu(2);
			var menuLevel2_3 = __createMenu(2);

			ctrl.registerMenu(menuLevel1_1);
			ctrl.registerMenu(menuLevel1_2);
			ctrl.registerMenu(menuLevel1_3);
			ctrl.registerMenu(menuLevel2_1);
			ctrl.registerMenu(menuLevel2_2);
			ctrl.registerMenu(menuLevel2_3);

			ctrl.openMenu(menuLevel1_1);
			expect(menuLevel1_1.closeMenu).not.toHaveBeenCalled();
			expect(menuLevel1_2.closeMenu).toHaveBeenCalled();
			expect(menuLevel1_3.closeMenu).toHaveBeenCalled();
			expect(menuLevel2_1.closeMenu).toHaveBeenCalled();
			expect(menuLevel2_2.closeMenu).toHaveBeenCalled();
			expect(menuLevel2_3.closeMenu).toHaveBeenCalled();
		});

		it('should open second level menu and close menu', function () {
			var menuLevel1_1 = __createMenu(1);
			var menuLevel1_2 = __createMenu(1);
			var menuLevel1_3 = __createMenu(1);
			var menuLevel2_1 = __createMenu(2);
			var menuLevel2_2 = __createMenu(2);
			var menuLevel2_3 = __createMenu(2);

			ctrl.registerMenu(menuLevel1_1);
			ctrl.registerMenu(menuLevel1_2);
			ctrl.registerMenu(menuLevel1_3);
			ctrl.registerMenu(menuLevel2_1);
			ctrl.registerMenu(menuLevel2_2);
			ctrl.registerMenu(menuLevel2_3);

			ctrl.openMenu(menuLevel2_1);
			expect(menuLevel1_1.closeMenu).not.toHaveBeenCalled();
			expect(menuLevel1_2.closeMenu).not.toHaveBeenCalled();
			expect(menuLevel1_3.closeMenu).not.toHaveBeenCalled();
			expect(menuLevel2_1.closeMenu).not.toHaveBeenCalled();
			expect(menuLevel2_2.closeMenu).toHaveBeenCalled();
			expect(menuLevel2_3.closeMenu).toHaveBeenCalled();
		});
	});

	describe('ldSidebarMenu', function () {

		beforeEach(inject(function ($compile) {
			$rootScope.opened = true;
			var element = angular.element('<ld-sidebar-menu></ld-sidebar-menu>');
			element.attr({
				data: createMenu(),
				opened: $rootScope.opened
			});

			element = $compile(element)($rootScope);
			$rootScope.$digest();

			var topul = element.find('ul').eq(0);
			expect(topul.hasClass('nav')).toBeTruthy();
			expect(topul.hasClass('nav-first-level')).toBeTruthy();

		}));
	});
});
