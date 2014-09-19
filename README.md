ldAdminTools
============

A collection of angular tools for admin sites.

Components
----------
####ldResize

Use as element:
```
<ld-resize ld-on-resize="handler"></ld-resize>
```
or as an attribute:
```
<div ld-resize ld-on-resize="handler"></div>
```
*handler* is a function called when browser window is resized
```
$scope.onResize = function(width, height) {
...
}
```
####ldMenu
Use as element:
```
<ld-menu data="menuData" level="menuLevel" menu-template="customTemplate" collapsed="boolean" ld-menu-options="options"></ld-menu>
```
or as an attribute:
```
<div ld-menu data="menuData" level="menuLevel" menu-template="customTemplate" collapsed="boolean" ld-menu-options="options"></div>
```
*menuData* in the scope has following structure:
```
data = [
   { 
      url: string,  // URL
      icon: string, // icon css style, 'fa-dashboard'
      text: string, // menu label
      badge: function // function with number as return value
      submenu: array // submenu array with the same structure
    }
]
```
*menuLevel* [optional]
number, which defines actual menu depth, default value 1
*collapsed* [optional]
boolean value, which defines if menu is collapsed, useful for responsive layouts or submenus
*options* [optional]
object with menu options - to be done
*menu-template* [optional]
custom defined template
