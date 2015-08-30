angular.module('AlbatekergoMain').service('EventService', ["$q", "$http", "$log", "UserService", function($q, $http, $log, UserService) {

    var selectedEvent;
    
    this.getSelectedEvent = function getSelectedEvent() {
        return selectedEvent;
    };
    
    this.setSelectedEvent = function setSelectedEvent(event) {
        selectedEvent = event;
    };

    this.getEvents = function getEvents(startDay) { 
        var deferred = $q.defer();
        $http.get("/api/events", {params: {startDay: startDay.format("YYYY-MM-DD")}})
            .success(function(result, status) {
                $log.debug("getEvents, status: " + status);
                $log.debug("getEvents, result: " + JSON.stringify(result));
                deferred.resolve(result);
            })
            .error(function(data, status, headers) {
                $log.debug("getEvents error: ");
                $log.debug("    data: " + data);
                $log.debug("    status: " + status);
                $log.debug("    headers: " + JSON.stringify(headers));
                deferred.reject(data, status);
            });
        return deferred.promise;
    };
    
    this.getEventsAdmin = function getEventsAdmin(startDay) { 
        var deferred = $q.defer();
        $http.get("/api/admin/events", {params: {startDay: startDay.format("YYYY-MM-DD")}})
            .success(function(result, status) {
                $log.debug("getEventsAdmin, status: " + status);
                $log.debug("getEventsAdmin, result: " + JSON.stringify(result));
                deferred.resolve(result);
            })
            .error(function(data, status, headers) {
                $log.debug("getEventsAdmin error: ");
                $log.debug("    data: " + data);
                $log.debug("    status: " + status);
                $log.debug("    headers: " + JSON.stringify(headers));
                deferred.reject(data, status);
            });
        return deferred.promise;
    };
    
    this.createEvent = function createEvent(event) { 
        var deferred = $q.defer();
        $http.post("/api/admin/events", event)
            .success(function(result, status) {
                $log.debug("createEventAdmin, status: " + status);
                $log.debug("createEventAdmin, result: " + JSON.stringify(result));
                deferred.resolve(result);
            })
            .error(function(data, status, headers) {
                $log.debug("createEventAdmin error: ");
                $log.debug("    data: " + data);
                $log.debug("    status: " + status);
                $log.debug("    headers: " + JSON.stringify(headers));
                deferred.reject(data, status);
            });
        return deferred.promise;
    };
    
    this.registerToEvent = function(eventId) { 
        var deferred = $q.defer();
        UserService.getUser().then(
            function(user) {
                $log.info("EventService, user: " + JSON.stringify(user));
                $http.post("/api/events/"+eventId+"/attendees", user)
                    .success(function(result, status) {
                        $log.debug("registerToEvent, status: " + status);
                        $log.debug("registerToEvent, result: " + JSON.stringify(result));
                        deferred.resolve(result);
                    })
                    .error(function(data, status, headers) {
                        $log.debug("Error reserving slot for day: " + event.date + " " + event.time);
                        $log.debug("    data: " + data);
                        $log.debug("    status: " + status);
                        $log.debug("    headers: " + JSON.stringify(headers));
                        deferred.reject(data, status);
                    });
            },
            function(data, status) {
                deferred.reject(data, status);
            });
        return deferred.promise;
    };
    
    this.unregisterFromEvent = function(eventId) { 
        var deferred = $q.defer();
        UserService.getUser().then(
            function(user) {
                $log.info("EventService, user: " + JSON.stringify(user));
                $http.delete("/api/events/"+eventId+"/attendees/" + user.email)
                    .success(function(result, status) {
                        $log.debug("unregisterFromEvent, status: " + status);
                        $log.debug("unregisterFromEvent, result: " + JSON.stringify(result));
                        deferred.resolve(result);
                    }).
                    error(function(data, status, headers) {
                        $log.debug("Error unregistering from event: " + event.date + " " + event.time);
                        $log.debug("    data: " + data);
                        $log.debug("    status: " + status);
                        $log.debug("    headers: " + JSON.stringify(headers));
                        deferred.reject(data, status);
                    });
            },
            function(data, status) {
                deferred.reject(data, status);
            });
        return deferred.promise;
    };
    
}]);