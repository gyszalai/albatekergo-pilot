
angular.module('AlbatekergoMain').controller("MainController", [
    "$log", "UserService", 
    function ($log, UserService) {
    
        var main = this;

        UserService.getUser().
                success(function(data, status, headers, config) {
                    $log.debug("UserService.getUser, status: ", status);
                    $log.debug("UserService.getUser, user: ", data);
                    main.user = data;
                }).
                error(function(data, status, headers, config) {
                    main.user = null;
                    $log.debug("Error getting user profile: ", data, status, headers);
                });
    }]);