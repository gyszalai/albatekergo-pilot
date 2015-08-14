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
    
    this.reserveSlot = function(eventId) { 
        return UserService.getUser()
                .success(function(user, status, headers, config) {
                    $log.info("EventService, user: ", user);
                    return $http.post("/api/events/"+eventId+"/attendees", user);
                });
    };
    
    this.isUserRegisteredForEvent = function(event, email) {    
        if (event.attendees) {
            event.attendees.forEach(function(attendee) {
                if (attendee.email === email) {
                    return true;
                }
            });
        }
        return false;
    };
    
}]);