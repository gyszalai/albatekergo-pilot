angular.module('AlbatekergoMain').service('EventService', ["$q", "$http", "$log", "UserService", function($q, $http, $log, UserService) {

    var selectedEvent;
    
    this.getSelectedEvent = function getSelectedEvent() {
        return selectedEvent;
    };
    
    this.setSelectedEvent = function setSelectedEvent(event) {
        selectedEvent = event;
    };

    this.getEvents = function getEvents() { 
        return $http.get("/api/events");
    };
    
    this.registerToEvent = function(eventId) { 
        var deferred = $q.defer();
        UserService.getUser()
            .success(function(user, status, headers, config) {
                $log.info("EventService, user: " + JSON.stringify(user));
                $http.post("/api/events/"+eventId+"/attendees", user)
                    .success(function(result, status, headers, config) {
                        $log.debug("registerToEvent, status: " + status);
                        $log.debug("registerToEvent, result: " + JSON.stringify(result));
                        deferred.resolve(result);
                    }).
                    error(function(data, status, headers, config) {
                        $log.debug("Error reserving slot for day: " + event.date + " " + event.time);
                        $log.debug("    data: " + data);
                        $log.debug("    status: " + status);
                        $log.debug("    headers: " + JSON.stringify(headers));
                        deferred.reject(data, status);
                    });
            })
            .error(function(data, status) {
                deferred.reject(data, status);
            });
        return deferred.promise;
    };
    
    this.unregisterFromEvent = function(eventId) { 
        var deferred = $q.defer();
        UserService.getUser()
            .success(function(user, status, headers, config) {
                $log.info("EventService, user: " + JSON.stringify(user));
                $http.delete("/api/events/"+eventId+"/attendees/" + user.email)
                    .success(function(result, status, headers, config) {
                        $log.debug("unregisterFromEvent, status: " + status);
                        $log.debug("unregisterFromEvent, result: " + JSON.stringify(result));
                        deferred.resolve(result);
                    }).
                    error(function(data, status, headers, config) {
                        $log.debug("Error unregistering from event: " + event.date + " " + event.time);
                        $log.debug("    data: " + data);
                        $log.debug("    status: " + status);
                        $log.debug("    headers: " + JSON.stringify(headers));
                        deferred.reject(data, status);
                    });
            })
            .error(function(data, status) {
                deferred.reject(data, status);
            });
        return deferred.promise;
    };
    
}]);