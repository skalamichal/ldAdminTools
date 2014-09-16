ldAdminTools
============

Admin Tools

Components
----------
**ldResize**

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
