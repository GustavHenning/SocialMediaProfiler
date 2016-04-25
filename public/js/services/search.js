angular.module("searchService", [])
    .factory("Search", ["$http", function($http){
        return {
          get: function() {
            return $http.get("/");
          }
        }
    }]);
