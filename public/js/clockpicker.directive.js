var app = angular.module("AlbatekergoMain");

    app.directive('clockpicker', ['$timeout', '$parse', function ($timeout, $parse) {
        return {
            restrict: 'C',
            require: 'ngModel',
            link: function link(scope, elm, attrs, ngModel) {
                var inputElm = $('input', elm);
                var modelGetter = $parse(attrs['ngModel']);
                var modelSetter = modelGetter.assign;
                function afterUpdate() {
                    return $timeout(function () {
                        var value = modelGetter(scope);
                        if (value) {
                            value = moment(value);
                        }
                        var inputVal = moment(inputElm.val(), 'HH:mm');
                        if (inputVal.isValid()) {
                            if (!value) {
                                modelSetter(scope, inputVal.toDate());
                            } else {
                                value.hour(inputVal.hour());
                                value.minute(inputVal.minute());
                                modelSetter(scope, value);
                                scope.$digest();
                            }
                        }
                    });
                }
                elm.clockpicker({
                        donetext: 'Done',
                        autoclose: true,
                        afterDone: afterUpdate
                    });
                inputElm.blur(afterUpdate);
                ngModel.$formatters.push(function (value) {
                    if (value) {
                        inputElm.val(moment(value).format('HH:mm'));
                    }
                    return value;
                });
            }
        };
    }]);

