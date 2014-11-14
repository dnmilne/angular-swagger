##angular-swagger

This module provides tools a simple, minimal interface for reading [Swagger](https://helloreverb.com/developers/swagger) documentation. 

The interface is built using ordinary [Bootstrap](http://getbootstrap.com) components, so you should find it very easy to theme and style.

## Dependencies

This requires [AngularJS](https://angularjs.org/). In addition, you will need:

 * [Bootstrap](http://getbootstrap.com)
 * [Angular UI Bootstrap](http://angular-ui.github.io/bootstrap/)


## Installation

1. Install with bower using `bower install angular-swagger`

2. Include `angular-swagger.js`, which should be located in `bower_components/angular-swagger`

3. Include `bootstrap.min.css` (which should be in `bower_components/bootstrap/dist/css`) 

4. Include `ui-bootstrap-tpls.min.js` (in `bower_components/angular-bootstrap`)

5. Add `angular-swagger` as a module dependency to your app.


## Usage

Simply create the following element

    <swagger-apis url='path/to/swagger' />

where `path/to/swagger` is the location of your swagger documentation (usually `/api-docs/`)

