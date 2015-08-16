angular.module('AlbatekergoMain').service('UserService', 
    ["$http", "$log", "$q", function($http, $log, $q) {
        this.getUser = function() { 
            var deferred = $q.defer();
            $http.get("/profile")
                .success(function(result, status, headers, config) {
                    $log.debug("UserService.getUser, status: " + status);
                    $log.debug("UserService.getUser, user: " + JSON.stringify(result));
                    deferred.resolve(result);
                })
                .error(function(data, status, headers, config) {
                    $log.debug("Error getting user profile");
                    $log.debug("    data: " + data);
                    $log.debug("    status: " + status);
                    $log.debug("    headers: " + JSON.stringify(headers));
                    deferred.reject(data, status);
                });
            return deferred.promise;
        };
    }]);