//var profiler = require("../../../lib/profiler.js");

angular.module("searchController", [])
    .controller("mainController", ["$scope", "$http", "Search", function($scope, $http, Search){
      /* SEARCH BUTTON */
      $scope.findPerson = function(){
          if($scope.formData.text){
            console.log("Search for " + $scope.formData.text);
            /* sanity checks */
            //profiler($scope.formData.text);
          }
      }
}]);
