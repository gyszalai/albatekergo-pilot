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

            var start = scope.selected.clone();
            start.weekday(0);
            _removeTime(start);

            _buildWeek(scope, start);

            scope.select = function (event) {
                scope.selected = event.dateTime;
                console.log("eventSelected", event);
                if (event.maxAttendees > event.attendees.length) {
                    showReserveSlotModal(scope, $modal, event);
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
                $log.debug("getEvents, status: ", status);
                $log.debug("getEvents, events: ", events);
                
                days.forEach(function(day) {
                    $log.debug("day: " + day.date.format("YYYY.MM.DD"));
                    day.events = [];
                    events.forEach(function (event) {
                        event.dateTime = moment(event.date + "T" + event.time);
                        if (day.date.format("YYYY-MM-DD") === event.date) {
                            day.events.push(event);
                            $log.debug("found: ", event);
                            // Free slots are represented as an array containing numbers
                            event.freeSlots = [];
                            for(var i=0 ; i < (event.maxAttendees - event.attendees.length); i++) {
                              event.freeSlots.push(i);
                            }
                            event.hasFreeSlots = event.freeSlots.length > 0;
                            event.registered = EventService.isUserRegisteredForEvent(event, user.email);
                        }
                    });
                });
            }).
            error(function(data, status, headers, config) {
                $log.debug("Error getting events: ", data, status, headers);
            });
  
    }
    
    function showReserveSlotModal(scope, $modal, event) {
        
        function ReserveSlotModalController($scope) {
            $scope.reserveSlot = function() {
                console.log("RESERVE SLOT: ", event.date);
                EventService.reserveSlot(event._id)
                    .success(function(result, status, headers, config) {
                        $log.debug("reserveSlot, status: ", status);
                        $log.debug("reserveSlot, result: ", result);
                        
                    }).
                    error(function(data, status, headers, config) {
                        $log.debug("Error reserving slot for day: ", event.date, data, status, headers);
                    });
                $scope.$hide();
            };
        }
        ReserveSlotModalController.$inject = ['$scope'];
        var reserveSlotModal = $modal({
            controller: ReserveSlotModalController, 
            title: 'Edzés ' + event.dateTime.format("YYYY. MMM. DD.") , 
            templateUrl: 'templates/week-reserve-slot-modal-tpl.html', 
            show: false
        });
        
        reserveSlotModal.$promise.then(reserveSlotModal.show);
    }
    
    function showNoMoreSlotsModal($modal, event) {
        var noMoreSlotsModal = $modal({
            title: 'Edzés ' + event.dateTime.format("YYYY. MMM. DD."), 
            content: 'Sajnos erre az edzésre már nem tudsz helyet foglalni', 
            show: true
        });
    }
    
    
}]);


