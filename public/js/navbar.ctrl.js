
angular.module('AlbatekergoMain').controller("NavbarController", [
    "$log", "UserService", 
    function ($log, UserService) {
    
    var navbar = this;
    
    UserService.getUser().
            success(function(data, status, headers, config) {
                $log.debug("UserService.getUser, status: ", status);
                $log.debug("UserService.getUser, user: ", data);
                navbar.user = data;
            }).
            error(function(data, status, headers, config) {
                navbar.user = null;
                $log.debug("Error getting user profile: ", data, status, headers);
            });
}]);