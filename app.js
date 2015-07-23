var app = angular.module('app', ['ng-swagger'])

    .controller('Ctrl', function($scope) {

        $scope.tmpUrl = undefined ;
        $scope.url = undefined ;

        $scope.loadPetstoreExample = function() {
            $scope.tmpUrl = "http://petstore.swagger.io/v2/swagger.json" ;
            $scope.load() ;
        }

        $scope.load = function() {
            $scope.url = undefined ;
            $scope.url = $scope.tmpUrl ;
        }

        $scope.load() ;

    }) ;