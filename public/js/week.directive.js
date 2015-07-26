var app = angular.module("AlbatekergoMain");

app.directive("week", ['TrainingDayService', '$log', '$modal', function (TrainingDayService, $log, $modal) {
    return {
        restrict: "E",
        templateUrl: "templates/week-template.html",
        scope: {
            selected: "="
        },
        link: function (scope) {
            scope.selected = _removeTime(scope.selected || moment());
            scope.currentWeek = scope.selected.clone();

            var start = scope.selected.clone();
            start.weekday(0);
            _removeTime(start);

            _buildWeek(scope, start);

            scope.select = function (day) {
                scope.selected = day.date;
                console.log("daySelected", day);
                if (day.isTrainingDay) {
                    if (day.maxAttendees > day.attendees.length) {
                        showReserveSlotModal(scope, $modal, day);
                    } else {
                        showNoMoreSlotsModal($modal, day);
                    }
                } else {
                    console.log("Not a training day: ", day.date);
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
                isTrainingDay: false,
                //isCurrentMonth: date.month() === month.month(),
                isToday: date.isSame(new Date(), "day"),
                date: date
            });
            date = date.clone();
            date.add(1, "d");
        }
        getAttendees(scope);
    }
    
    function getAttendees(scope) {
        
        TrainingDayService.getTrainingDays()
            .success(function(trainingDays, status, headers, config) {
                $log.debug("getTrainingDays, status: ", status);
                $log.debug("getTrainingDays, trainingDays: ", trainingDays);
                
                scope.days.forEach(function(day) {
                    $log.debug("day: " + day.date.format("YYYY.MM.DD"));
                    trainingDays.forEach(function (trainingDay) {
                        if (day.date.format("YYYY-MM-DD") === trainingDay.date) {
                            day.attendees = trainingDay.attendees || [];
                            $log.debug("found: ", trainingDay);
                            day.isTrainingDay = true;
                            day.maxAttendees = trainingDay.maxAttendees;
                            // Free slots are represented as an array containing numbers
                            var freeSlots = [];
                            for(var i=0 ; i < (day.maxAttendees - day.attendees.length); i++) {
                              freeSlots.push(i);
                            }
                            day.freeSlots = freeSlots;
                            day._id = trainingDay._id;
                        }
                    });
                });
            }).
            error(function(data, status, headers, config) {
                $log.debug("Error getting trainingdays: ", data, status, headers);
            });
  
    }
    
    function showReserveSlotModal(scope, $modal, day) {
        
        function ReserveSlotModalController($scope) {
            $scope.reserveSlot = function() {
                console.log("RESERVE SLOT: ", day.date);
                $scope.$hide();
            };
        }
        ReserveSlotModalController.$inject = ['$scope'];
        var reserveSlotModal = $modal({
            controller: ReserveSlotModalController, 
            title: 'Edzésnap ' + day.date.format("YYYY. MMM. DD.") , 
            templateUrl: 'templates/week-reserve-slot-modal-tpl.html', 
            show: false
        });
        
        reserveSlotModal.$promise.then(reserveSlotModal.show);
    }
    
    function showNoMoreSlotsModal($modal, day) {
        var noMoreSlotsModal = $modal({
            title: 'Edzésnap ' + day.date.format("YYYY. MMM. DD."), 
            content: 'Sajnos erre a napra már nem tudsz helyet foglalni', 
            show: true
        });
    }
    
    
}]);


