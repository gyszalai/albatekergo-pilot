var app = angular.module("AlbatekergoMain");

app.directive("weekAdmin", ['EventService', 'TrainerService', '$log', '$modal', function (EventService, TrainerService, $log, $modal) {
    return {
        restrict: "E",
        templateUrl: "templates/week-admin-template.html",
        scope: {
            selected: "=",
            user: "="
        },
        link: function (scope) {
            scope.selected = _removeTime(scope.selected || moment());
            scope.currentWeek = scope.selected.clone();
            scope.currentWeek.weekday(0);
            $log.info("******** current user: " + JSON.stringify(scope.user));

            var start = scope.selected.clone();
            start.weekday(0);
            _removeTime(start);

            _buildWeek(scope, start);

            scope.select = function (event) {
                console.log("eventSelected: " + event.dateTime);
                showEventDetailsModal(scope, $modal, event);
            };
            
            scope.createEvent = function (day) {
                console.log("createEvent");
                showCreateEventModal(scope, $modal, day);
            };
            
            scope.deleteEvent = function (event) {
                console.log("deleteEvent");
                showDeleteEventModal(scope, $modal, event);
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
        getEvents(scope.currentWeek, scope.user, scope.days);
    }
    
    function getEvents(startDay, user, days) {
        EventService.getEventsAdmin(startDay)
            .then(function(events) {
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
                            event.freeSlots = 0;
                            for(var i=0 ; i < (event.maxAttendees - event.attendees.length); i++) {
                              event.freeSlots++;
                            }
                            event.hasFreeSlots = event.freeSlots > 0;
                        }
                    });
                });
            })
            .catch(function(data, status) {
                $log.debug("Error getting events: " + data);
                $log.debug("    status: " + status);
            });
    }
    
    function showEventDetailsModal(scope, $modal, event) {
        
        function ShowEventDetailsModalController($scope) {
            $scope.event = event;
        }
        
        ShowEventDetailsModalController.$inject = ['$scope'];
        var showEventDetails = $modal({
            controller: ShowEventDetailsModalController, 
            title: 'Esemény részletei ' + event.dateTime.format("YYYY. MMM. DD. HH:mm") , 
            templateUrl: 'templates/event-details-modal-tpl.html', 
            show: false
        });
        
        showEventDetails.$promise.then(showEventDetails.show);
    }
    
    
    function showCreateEventModal(scope, $modal, day) {
        
        function CreateEventModalController($scope) {
            $scope.createEvent = function() {
                console.log("Create event: " + day.date);
                
                var newEvent = $scope.newEvent;
                newEvent.time = newEvent.time.format("HH:mm");
                newEvent.date = day.date.format("YYYY-MM-DD");
                newEvent.trainer = newEvent.trainer.name;
                newEvent.attendees = [];
                console.log("########## Create event: " + $scope.newEvent);
                EventService.createEvent(newEvent).then(
                    function(event) {
                        _buildWeek(scope, scope.currentWeek);
                    },
                    function(err, status) { // failure
                        $log.info("createEvent error: " + err);
                    });
                $scope.$hide();
            };
            
            $scope.newEvent = {
                maxAttendees: 16 //,
                //time: moment("10:00", 'HH:mm')
            };
            
            TrainerService.getTrainers().then(function (trainers) {
                $scope.trainers = trainers;
            });

            $scope.day = day;
        }
        CreateEventModalController.$inject = ['$scope'];
        var createEventModal = $modal({
            controller: CreateEventModalController, 
            title: 'Új esemény ' + day.date.format("YYYY. MMM. DD."), 
            templateUrl: 'templates/create-event-modal-tpl.html', 
            show: false
        });
        
        createEventModal.$promise.then(createEventModal.show);
    }
    
}]);


