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

####ldClickableRows
A simple directive that allows you to make table rows clickable. While you could simply put the `ng-click` directive on a `<tr>` element, that would make the whole row clickable, which is not always desirable (for example if you have input columns, such as checkboxes, on your rows). This directive should be placed on a `<tr>` element, and will add `ng-click` to the individual `<td>` elements inside the row, skipping those containing an `<input>`.

Example usage:

```html
<tr ng-repeat="company in companies" ld-clickable-rows="rowClicked(company)">
  ...
</tr>
```

This will result in `ng-click="rowClicked(company)` being added to each of the `<td>` elements inside the row (except for those with inputs) as well as css class `ld-clickable` being applied to those `<td>`s. By default, `ld-clickable` changes the mouse cursor to a hand pointer.

Optionally, ld-clickable-rows-active allows you to specify additional - conditional - CSS class to the `<td>` elements besides ld-clickable. This is useful for displaying "unread" items in an inbox-like list, or similar. Example:

```html
<tr ng-repeat="message in messages" ld-clickable-rows="messageClicked(message)" ld-clickable-rows-active="{'ld-unread': !message.read}" ng-class="{'ld-unread-row': !message.read && !message.selected, 'warning': message.selected }">
  <td><input type="checkbox" ng-model="message.selected"></td>
  <td>{{message.subject}}</td>
  <td>{{message.date | date}}</td>
</tr>
```

####ldMessageBox (service)
A simple service used to display a short message on the top of the window, for example loading node. Has two methods:
* show(message, type, icon, spin):
  * message - description to show
  * type - box style - currently default and loading are defined
  * icon - font awesome icon
  * spin - boolean value, if true, icon is animated

* hide()

Usage in page controller:

```html
<div ng-controller='sample'>
  <a href='' ng-click='toggle()'>Toggle loading box</a>
</div>
```

```js
app.controller('sample', ['$scope', 'ldMessageBox', function($scope, messagebox) {
  $scope.loading = false;
  $scope.toggle = function() {
    $scope.loading = != $scope.loading;
    if ($scope.opened) {
      // show loading message
      messagebox.show('Loading...', 'loading', 'fa-spinner', true);
    } 
    else {
      messagebox.hide();
    }
  }
}]);
```
