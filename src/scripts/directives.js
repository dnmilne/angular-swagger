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