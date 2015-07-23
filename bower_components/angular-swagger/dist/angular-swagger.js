angular.module('ng-swagger', ['ng-swagger.directives','ng-swagger.controllers','ng-swagger.services','ng-swagger.filters','ng-swagger.templates']);
angular.module('ng-swagger.controllers', [])

.controller("ApiSchemaModalCtrl", function($scope, $modalInstance, name, definition, api) {

        $scope.name = name ;
        $scope.definition = definition ;
        $scope.api = api ;


    }) ;
angular.module('ng-swagger.directives', ['ui.bootstrap'])

.directive('apiDocs', function ($http) {


        return {
            restrict: 'E',
            scope: {
                url: '='
            },
            templateUrl: "api-docs.tmpl.html",
            link: function ($scope, element, attrs) {

                $scope.api = undefined ;

                $scope.$watch("url", function() {

                    console.log("url changed to " + $scope.url)

                    $scope.api = undefined ;

                    if (!$scope.url)
                        return ;

                    $http.get($scope.url).success(
                        function(data) {

                            console.log(data);
                            setApi(data);
                        }
                    ) ;

                }) ;

                function setApi(api) {

                    $scope.api = api ;

                    //make it easier to parse

                    _.each(api.paths, function (endpoints, path) {
                        _.each(endpoints, function(endpoint, method) {
                            console.log(method + " " + path) ;

                            endpoint.method = method ;
                            endpoint.path = path ;

                            _.each(endpoint.tags, function (tag) {

                                var tagDetails = _.find(api.tags, function(t) {
                                    return t.name == tag ;
                                }) ;

                                if (!tagDetails.endpoints)
                                    tagDetails.endpoints = [] ;

                                tagDetails.endpoints.push(endpoint) ;
                            }) ;

                        }, this) ;
                    }, this)

                    console.log(api) ;
                }


            }
        }

    })


.directive('apiTag', function() {

    return {
        restrict: 'E',
        scope: {
            tag: '=',
            api: '='
        },
        templateUrl: "api-tag.tmpl.html",
        link: function ($scope, element, attrs) {

            $scope.state = {expanded:false} ;

        }
    }
})

.directive('apiEndpoint', function() {

        return {
            restrict: 'E',
            scope: {
                endpoint: '=',
                api:'='
            },
            templateUrl: "api-endpoint.tmpl.html",
            link: function($scope, element, attrs) {

                $scope.state = {expanded:false} ;

                $scope.formatPath = function(path) {
                    return path.replace(/\{([^}]*)\}/mg, "<span class='text-muted'>{$1}</span>");
                }

                $scope.methodClass = getMethodClass($scope.endpoint.method) ;

                $scope.parametersByType = {} ;

                $scope.parametersByType["path"] = getParametersByType("path") ;
                $scope.parametersByType["body"] = getParametersByType("body") ;
                $scope.parametersByType["query"] = getParametersByType("query") ;


                function getMethodClass(verb) {

                    switch(verb) {
                        case 'get' :
                            return "label-success" ;
                        case 'post' :
                        case 'put' :
                            return "label-primary" ;
                        case 'delete' :
                            return "label-danger"
                    }

                    return "label-success" ;
                }

                function getParametersByType(type) {

                    return _.filter($scope.endpoint.parameters, function(param) {
                        return param.in == type ;
                    }, this) ;
                }


            }
        }
    })


.directive('apiParameter', function() {

        return {
            scope: {
                param: '=',
                api: '='
            },
            templateUrl: "api-parameter.tmpl.html",
            link: function($scope, element, attrs) {


            }
        }
    })

.directive('apiResponse', function() {

        return {
            scope: {
                code: '=',
                response: '=',
                api: '='
            },
            templateUrl: "api-response.tmpl.html",
            link: function($scope, element, attrs) {

                $scope.getResponseCodeClass = function(code) {

                    if (code>=200 && code < 300 || code=='default')
                        return "label-success" ;

                    return "label-danger" ;
                }
            }
        }
    })


.directive('apiTypeBadge', function($modal) {

        var refRegex = /^#\/definitions\/(.*)$/i;

        return {
            scope: {
                details: '=',
                api: '=',
            },
            replace: true,
            templateUrl: "api-type-badge.tmpl.html",
            link: function($scope, element, attrs) {

                function init() {

                    var d = $scope.details ;

                    $scope.label = "unknown" ;
                    $scope.schemaRef = undefined ;

                    if (d.type) {

                        if (d.enum) {
                            $scope.label = "enum";
                        } else if (d.items) {

                            if (d.items.enum) {
                                $scope.label = d.type + "<enum>";
                            } else if (d.items.format) {
                                $scope.label = d.type + "<" + d.items.format + ">";
                            } else if (d.items.type) {
                                $scope.label = d.type + "<" + d.items.type + ">";
                            } else if (d.items.$ref){
                                $scope.label = d.type + "<" + getSchemaName(d.items.$ref) + ">" ;
                                $scope.schemaRef = d.items.$ref ;
                            } else {
                                $scope.label = d.type + "<unknown>" ;
                            }
                        } else {
                            if (d.format)
                                $scope.label = d.format ;
                            else
                                $scope.label = d.type ;
                        }
                    } else if (d.schema) {

                        if (d.schema.$ref) {
                            $scope.label = getSchemaName(d.schema.$ref);
                            $scope.schemaRef = d.schema.$ref ;
                        } else if (d.schema.items) {

                            if (d.schema.items.format) {
                                $scope.label = d.schema.type + "<" + d.schema.items.format + ">";
                            } else if (d.schema.items.type) {
                                $scope.label = d.schema.type + "<" + d.schema.items.type + ">";
                            } else if (d.schema.items.$ref) {
                                $scope.label = d.schema.type + "<" + getSchemaName(d.schema.items.$ref) + ">";
                                $scope.schemaRef = d.schema.items.$ref ;
                            } else {
                                $scope.label = d.schema.type + "<unknown>" ;
                            }
                        } else {
                            return "unknown";
                        }

                    } else if (d.$ref) {
                        $scope.label = getSchemaName(d.$ref);
                        $scope.schemaRef = d.$ref ;
                    }
                }

                function getSchemaName(ref) {
                    var match = refRegex.exec(ref);

                    if (!match ) {
                        console.error("Could not parse " + ref) ;
                        return ;
                    }

                    return match[1] ;
                }


                $scope.showModal = function() {

                    if (!$scope.schemaRef)
                        return ;

                    var schemaName = getSchemaName($scope.schemaRef) ;
                    var schemaDefinition = $scope.api.definitions[schemaName] ;

                    var modalInstance = $modal.open({
                        templateUrl: "api-schema-modal.tmpl.html",
                        controller: 'ApiSchemaModalCtrl',
                        resolve: {
                            name: function () {
                                return schemaName;
                            },
                            definition: function () {
                                return schemaDefinition;
                            },
                            api: function() {
                                return $scope.api ;
                            }
                        }
                    });
                }

                init() ;
            }
        }

    })



.directive('apiSchemaProperty', function() {

    return {
        scope: {
            propertyName: '=',
            property: '=',
            api: '=',
        },
        templateUrl: "api-schema-property.tmpl.html",
        link: function($scope, element, attrs) {


        }
    }
})
angular.module('ng-swagger.filters', [])


.filter('unsafe', function($sce) {
    return $sce.trustAsHtml;
})

.filter('markdown', function() {

    var md = window.markdownit('commonmark');

    return function(markdown) {

        if (!markdown)
            return ;

        return md.renderInline(markdown) ;
    }
})


angular.module('ng-swagger.services', [])
angular.module('ng-swagger.templates', ['api-docs.tmpl.html', 'api-endpoint.tmpl.html', 'api-parameter.tmpl.html', 'api-response.tmpl.html', 'api-schema-modal.tmpl.html', 'api-schema-property.tmpl.html', 'api-tag.tmpl.html', 'api-type-badge.tmpl.html']);

angular.module('api-docs.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('api-docs.tmpl.html',
    '<p><h1>{{api.info.title}} <small>{{api.info.version}}</small></h1></p><p ng-bind-html="api.info.description | markdown | unsafe"></p><p ng-show="api.info.license.name || api.info.termsOfService"><span ng-show=api.info.license.name>Shared under the <a ng-href={{api.info.license.url}}>{{api.info.license.name}}</a> licence.</span> <span ng-show=api.info.termsOfService>Check <a ng-href={{api.info.termsOfService}}>here</a> for terms of service.</span></p><p ng-show=api.info.contact>If you need help, contact <a ng-show=api.info.contact.email ng-href=mailto:{{api.info.contact.email}}><span ng-show=api.info.contact.name>{{api.info.contact.name}}</span> <span ng-show="!api.info.contact.name ">{{api.info.contact.email}}</span></a> <strong ng-show=!api.info.contact.email>{{api.info.contact.name}}</strong></p><br><api-tag ng-repeat="tag in api.tags" tag=tag api="api">');
}]);

angular.module('api-endpoint.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('api-endpoint.tmpl.html',
    '<div><h4 ng-click="state.expanded = !state.expanded" style=cursor:pointer><span ng-hide=state.expanded><i class="fa fa-plus-square"></i>&nbsp;</span> <span ng-show=state.expanded><i class="fa fa-minus-square"></i>&nbsp;</span> <span class="label {{methodClass}}">{{endpoint.method | uppercase}}</span> <span ng-bind-html="formatPath(endpoint.path) | unsafe"></span></h4><p ng-show=endpoint.summary style="padding-left: 30px" ng-bind-html="endpoint.summary | markdown | unsafe"></p><p ng-hide=endpoint.summary>no description</p><div ng-show=state.expanded style="padding-left: 30px"><p style="padding-top:10px ; padding-left: 5px"><span ng-if=endpoint.consumes.length><span class="text-muted small">consumes:</span> <span ng-repeat="c in endpoint.consumes"><span ng-if=!$first>&nbsp;</span> <code>{{c}}</code></span> &nbsp;&nbsp;</span> <span ng-if=endpoint.produces.length><span class="text-muted small">produces:</span> <span ng-repeat="p in endpoint.produces"><span ng-if=!$first>&nbsp;</span> <code>{{p}}</code></span></span></p><table class=property-table><tr ng-if=parametersByType[&quot;path&quot;].length><td colspan=3 class="text-muted small text-left" style="padding-top: 10px">path parameters:</td></tr><tr ng-repeat="param in parametersByType[&quot;path&quot;]" api-parameter param=param api=api></tr><tr ng-if=parametersByType[&quot;body&quot;].length><td colspan=3 class="text-muted small text-left" style="padding-top: 10px">body parameters:</td></tr><tr ng-repeat="param in parametersByType[&quot;body&quot;]" api-parameter param=param api=api></tr><tr ng-if=parametersByType[&quot;query&quot;].length><td colspan=3 class="text-muted small text-left" style="padding-top: 10px">query parameters:</td></tr><tr ng-repeat="param in parametersByType[&quot;query&quot;]" api-parameter param=param api=api></tr><tr><td colspan=3 class="text-muted small text-left" style="padding-top: 10px">responses:</td></tr><tr ng-repeat="(code,response) in endpoint.responses" api-response code=code response=response api=api></tr></table></div><br></div>');
}]);

angular.module('api-parameter.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('api-parameter.tmpl.html',
    '<td class=text-right style="padding-left: 20px"><strong>{{param.name}}</strong></td><td class=text-center><api-type-badge details=param api="api"></td><td><p><span ng-if="!param.required && param.in==\'query\'" class=text-muted>optional -</span> <span ng-show=param.description ng-bind-html="param.description | markdown | unsafe"></span> <span ng-hide=param.description>no description</span></p><p ng-if=param.enum>One of <span ng-repeat="e in param.enum"><span ng-if="!$first && !$last">,</span> <span ng-if=$last>or</span> <code>{{e}}</code></span></p><p ng-if=param.items.enum>One or more of <span ng-repeat="e in param.items.enum"><span ng-if="!$first && !$last">,</span> <span ng-if=$last>or</span> <code>{{e}}</code></span></p><p ng-if=param.default>Defaults to <code>{{param.default}}</code></p><p ng-if=param.items.default>Defaults to <code>{{param.items.default}}</code></p></td>');
}]);

angular.module('api-response.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('api-response.tmpl.html',
    '<td class=text-right style="padding-left: 20px"><p><span class="label {{getResponseCodeClass(code)}}" style="padding: 3px 7px ; line-height: 1; vertical-align: middle ; display: inline-block ; font-size:12px ; margin-bottom: 3px">{{code}}</span> &nbsp;</p></td><td class=text-center><p><api-type-badge details=response api="api"></p></td><td><p ng-show=response.description>{{response.description}}</p><p ng-hide=response.description>no description</p></td>');
}]);

angular.module('api-schema-modal.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('api-schema-modal.tmpl.html',
    '<div class=modal-header><button type=button class=close ng-click=$dismiss()><span aria-hidden=true>&times;</span></button> <strong>{{name}}</strong></div><div class=modal-body><p ng-bind-html="definition.description | markdown | unsafe"></p><p ng-hide=definition.description>no description</p><br><table class=property-table><tr ng-repeat="(propertyName,property) in definition.properties" api-schema-property property-name=propertyName property=property api=api></tr></table></div>');
}]);

angular.module('api-schema-property.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('api-schema-property.tmpl.html',
    '<td class=text-right style="padding-left: 20px"><strong>{{propertyName}}</strong></td><td class=text-center><api-type-badge details=property api="api"></td><td><p ng-show=property.description ng-bind-html="property.description | markdown | unsafe"></p><p ng-hide=property.description>no description</p><p ng-if=property.enum>One of <span ng-repeat="e in property.enum"><span ng-if="!$first && !$last">,</span> <span ng-if=$last>or</span> <code>{{e}}</code></span></p><p ng-if=property.default>Defaults to <code>{{param.default}}</code></p></td>');
}]);

angular.module('api-tag.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('api-tag.tmpl.html',
    '<div><h3 ng-click="state.expanded = !state.expanded" style=cursor:pointer><span ng-hide=state.expanded><i class="fa fa-plus-square"></i>&nbsp;</span> <span ng-show=state.expanded><i class="fa fa-minus-square"></i>&nbsp;</span> <span>{{tag.name}}</span></h3><p ng-show=tag.description style="padding-left: 30px" ng-bind-html="tag.description | markdown | unsafe"></p><br><div ng-show=state.expanded style="padding-left: 30px"><api-endpoint ng-repeat="endpoint in tag.endpoints" endpoint=endpoint api="api"></div></div>');
}]);

angular.module('api-type-badge.tmpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('api-type-badge.tmpl.html',
    '<p><span ng-hide=schemaRef class="badge badge-default">{{label}}</span> <span ng-show=schemaRef class="badge badge-primary" style=cursor:pointer ng-click=showModal()>{{label}}</span></p>');
}]);
