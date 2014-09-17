/**
 * @ngdoc directive
 * @name directive:menu
 * @description
 * # ldmenu
 */
angular.module('ldAdminTools')
	.directive('ldMenu', ['$compile', function ($compile) {
		function getMenuTemplate(level) {
			// basic style
			var levelStyle = 'nav';

			// sub menu style
			if (level === 2) {
				levelStyle += ' nav-second-level';
			}
			else if (level === 3) {
				levelStyle += ' nav-third-level';
			}

			var tpl = '<ul class="' + levelStyle + '">';

			// repeat through data array, set the collapsed state to true
			tpl += '<li ng-repeat="item in data" ng-init="isCollapsed=true">';
			// add on click handler, which will open sub menu
			tpl += '<a ld-menuitem ng-href="{{item.url}}" ng-click="isCollapsed = !isCollapsed">';
			// if item icon is defined add it
			tpl += '<i ng-if="item.icon.length > 0" class="fa fa-fw {{item.icon}}"></i>';
			tpl += ' {{ item.text }} ';
			// if badge function is defined add it
			tpl += '<span class="badge" ng-if="item.badge && item.badge() > 0">{{ item.badge() }}</span>';
			// if sub menu is defined, add small arrow to the right side. The icon is updated based on isCollapsed value
			tpl += '<span ng-if="item.submenu" class="fa ld-right" ng-class="isCollapsed? \'fa-angle-left\' : \'fa-angle-down\'"></span>';
			tpl += '</a>';

			// if sub menu is defined add it here
			tpl += '<div ng-if="item.submenu">';
			tpl += '<div ld-menu collapse="isCollapsed" data="item.submenu" level="' + (level + 1) + '"></div>';
			tpl += '</div>';

			tpl += '</li>';

			tpl += '</ul>';

			return tpl;
		}

		function getTemplate(element, attrs) {
			// get the menu level (up to three levels are supported)
			var level = Number((angular.isDefined(attrs.level) ? attrs.level : 1));

			var tpl = '';
			if (level === 1) {
				tpl += '<div class="navbar-default navbar-static-side" role="navigation">';
				tpl += '<div class="sidebar-collapse" collapse="collapsed">';
			}

			tpl += getMenuTemplate(level);

			if (level === 1) {
				tpl += '</div></div>';
			}

			return tpl;
		}

		return {
			template: function (tElement, tAttrs) {
				return getTemplate(tElement, tAttrs);
			},
			restrict: 'EA',
			scope: {
				'data': '=',
				'level': '=',
				'collapsed': '='
			},
			require: '?^ldMenu',
			controller: [function () {
			}],
			compile: function (el) {
				var contents = el.contents().remove();
				var compiled;
				return function (scope, el) {
					if (!compiled) {
						compiled = $compile(contents);
					}

					compiled(scope, function (clone) {
						el.append(clone);
					});
				};
			}
		};
	}]);
