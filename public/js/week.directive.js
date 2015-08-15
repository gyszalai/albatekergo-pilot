var app = angular.module("AlbatekergoMain");

app.directive("week", ['EventService', '$log', '$modal', function (EventService, $log, $modal) {
    return {
        restrict: "E",
        templateUrl: "templates/week-template.html",
        scope: {
            selected: "=",
            user: "="
        },
        link: function (scope) {
            scope.selected = _removeTime(scope.selected || moment());
            scope.currentWeek = scope.selected.clone();
            $log.info("******** current user: " + JSON.stringify(scope.user));

            var start = scope.selected.clone();
            start.weekday(0);
            _removeTime(start);

            _buildWeek(scope, start);

            scope.select = function (event) {
                scope.selected = event.dateTime;
                console.log("eventSelected", event);
                if (event.maxAttendees > event.attendees.length) {
                    if (event.registered) {
                        showUnregisterFromEventModal(scope, $modal, event);
                    } else {
                        showRegisterToEventModal(scope, $modal, event);
                    }
                } else {
                    showNoMoreSlotsModal($modal, event);
                }
            };

            scope.next = function () {
                var nextWeek = scope.currentWeek.clone();
                _removeTime(nextWeek.week(nextWeek.week() + 1).weekday(0));
                scope.currentWeek.week(scope.currentWeek.week() + 1);
                _buildWeek(scope, nextWeek);
            };

            scope.previous = function () {
                var previousWeek = scope.currentWeek.clone();
                _removeTime(previousWeek.week(previousWeek.week() - 1).weekday(0));
                scope.currentWeek.week(scope.currentWeek.week() - 1);
                _buildWeek(scope, previousWeek);
            };
        }
    };

    function _removeTime(date) {
        return date.hour(0).minute(0).second(0).millisecond(0);
    }

    function _buildWeek(scope, date) {
        
        scope.days = [];
        for (var i = 0; i < 7; i++) {
            
            scope.days.push({
                name: date.format("dd").substring(0, 1),
                number: date.date(),
                //isCurrentMonth: date.month() === month.month(),
                isToday: date.isSame(new Date(), "day"),
                date: date
            });
            date = date.clone();
            date.add(1, "d");
        }
        getEvents(scope.user, scope.days);
    }
    
    
    function getEvents(user, days) {
        
        EventService.getEvents()
            .success(function(events, status, headers, config) {
                $log.debug("getEvents, status: " + status);
                $log.debug("getEvents, events: " + JSON.stringify(events));
                $log.debug("getEvents, user: " + JSON.stringify(user));
                
                days.forEach(function(day) {
                    $log.debug("day: " + day.date.format("YYYY.MM.DD"));
                    day.events = [];
                    events.forEach(function (event) {
                        event.dateTime = moment(event.date + "T" + event.time);
                        if (day.date.format("YYYY-MM-DD") === event.date) {
                            day.events.push(event);
                            $log.debug("found: " + JSON.stringify(event));
                            // Free slots are represented as an array containing numbers
                            event.freeSlots = [];
                            for(var i=0 ; i < (event.maxAttendees - event.attendees.length); i++) {
                              event.freeSlots.push(i);
                            }
                            event.hasFreeSlots = event.freeSlots.length > 0;
//                            event.registered = EventService.isUserRegisteredForEvent(event, user.email);
//                            $log.debug("*** checking event: " + JSON.stringify(event));
//                            $log.debug("*** already registered to this event: " + event.registered);
                        }
                    });
                });
            }).
            error(function(data, status, headers, config) {
                $log.debug("Error getting events: " + data);
                $log.debug("    status: " + status);
                $log.debug("    headers: " + JSON.stringify(headers));
            });
  
    }
    
    function showRegisterToEventModal(scope, $modal, event) {
        
        function RegisterToEventModalController($scope) {
            $scope.registerToEvent = function() {
                console.log("Register to event: " + event.date + " " + event.time);
                EventService.registerToEvent(event._id).then(
                    function(refreshedEvent) {
                        $log.info("registerToEvent successful");
                        $log.info("refreshed event: " + JSON.stringify(refreshedEvent));
                        event.attendees = refreshedEvent.attendees;
                        event.registered = refreshedEvent.registered;
                    },
                    function(result, status) { // failure
                        $log.info("registerToEvent error: " + result);
                    });
                $scope.$hide();
            };
        }
        RegisterToEventModalController.$inject = ['$scope'];
        var registerToEvent = $modal({
            controller: RegisterToEventModalController, 
            title: 'Edzés ' + event.dateTime.format("YYYY. MMM. DD.") , 
            templateUrl: 'templates/register-to-event-modal-tpl.html', 
            show: false
        });
        
        registerToEvent.$promise.then(registerToEvent.show);
    }
    
    
    function showUnregisterFromEventModal(scope, $modal, event) {
        
        function UnregisterFromEventModalController($scope) {
            $scope.unregisterFromEvent = function() {
                console.log("Unregister from event: " + event.date + " " + event.time);
                EventService.unregisterFromEvent(event._id).then(
                    function(refreshedEvent) {
                        $log.info("unregisterFromEvent successful");
                        $log.info("refreshed event: " + JSON.stringify(refreshedEvent));
                        event.attendees = refreshedEvent.attendees;
                        event.registered = refreshedEvent.registered;
                    },
                    function(result, status) { // failure
                        $log.info("unregisterFromEvent error: " + result);
                    });
                $scope.$hide();
            };
        }
        UnregisterFromEventModalController.$inject = ['$scope'];
        var unregisterFromEvent = $modal({
            controller: UnregisterFromEventModalController, 
            title: 'Edzés ' + event.dateTime.format("YYYY. MMM. DD. HH:mm") , 
            templateUrl: 'templates/unregister-from-event-modal-tpl.html', 
            show: false
        });
        
        unregisterFromEvent.$promise.then(unregisterFromEvent.show);
    }
    
    
    
    function showNoMoreSlotsModal($modal, event) {
        var noMoreSlotsModal = $modal({
            title: 'Edzés ' + event.dateTime.format("YYYY. MMM. DD."), 
            content: 'Sajnos erre az edzésre már nem tudsz helyet foglalni', 
            show: true
        });
    }
    
    
}]);


