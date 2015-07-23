angular.module('ng-swagger.controllers', [])

.controller("ApiSchemaModalCtrl", function($scope, $modalInstance, name, definition, api) {

        $scope.name = name ;
        $scope.definition = definition ;
        $scope.api = api ;


    }) ;