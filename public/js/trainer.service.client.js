angular.module('AlbatekergoMain').service('TrainerService', ["$q", "$http", "$log", function($q, $http, $log) {

    this.getTrainers = function getTrainers() { 
        var deferred = $q.defer();
        $http.get("/api/trainers")
            .success(function(result, status) {
                $log.debug("getTrainers, status: " + status);
                $log.debug("getTrainers, result: " + JSON.stringify(result));
                deferred.resolve(result);
            })
            .error(function(data, status, headers) {
                $log.debug("getTrainers error: ");
                $log.debug("    data: " + data);
                $log.debug("    status: " + status);
                $log.debug("    headers: " + JSON.stringify(headers));
                deferred.reject(data, status);
            });
        return deferred.promise;
    };
    
}]);