##angular-swagger

This module provides a simple, minimal interface for reading [Swagger 2](https://helloreverb.com/developers/swagger) documentation.
Check out the [demo page](http://dnmilne.github.io/angular-swagger) to see what we mean.

The interface is built using ordinary [Bootstrap](http://getbootstrap.com) components, so you should find it very easy to theme and style.

## Dependencies

This requires [AngularJS](https://angularjs.org/). In addition, you will need:

 * [Bootstrap](http://getbootstrap.com)
 * [Angular UI Bootstrap](http://angular-ui.github.io/bootstrap/)
 * [Markdown It](https://github.com/markdown-it/markdown-it)
 * [Lodash](https://lodash.com/)
 * [Font Awesome](http://fortawesome.github.io/Font-Awesome/)

 But all of that is handled automatically if you install via [bower](http://bower.io/).

## Installation

1. Install with bower

    ```
    bower install angular-swagger
    ```

2. Include all scripts and dependencies in your html

    ```
    <link type="text/css" href="bower_components/bootstrap/dist/css/bootstrap.css" rel="stylesheet"/>
    <link type="text/css" href="bower_components/font-awesome/css/font-awesome.css" rel="stylesheet"/>
    <link type="text/css" href="bower_components/angular-swagger/dist/angular-swagger.css" rel="stylesheet"/>

    <script type="application/javascript" src="bower_components/angular/angular.js"></script>
    <script type="application/javascript" src="bower_components/angular-sanitize/angular-sanitize.min.js"></script>
    <script type="application/javascript" src="bower_components/lodash/lodash.min.js"></script>
    <script type="application/javascript" src="bower_components/markdown-it/dist/markdown-it.min.js"></script>

    <script type="application/javascript" src="bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js"></script>
    <script type="application/javascript" src="bower_components/angular-swagger/dist/angular-swagger.js"></script>
    ```

3. Add `ng-swagger` as a module dependency to your Angular app


## Usage

Simply create the following element

    <api-docs url='path/to/swagger.json' />

where `path/to/swagger.json` is the location of your swagger 2 documentation (usually `v2/api-docs/`)

