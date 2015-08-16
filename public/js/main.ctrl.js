
angular.module('AlbatekergoMain').controller("MainController", 
    ["$log", "UserService", function ($log, UserService) {
        var main = this;
        UserService.getUser().then(
                function(user) {
                    main.user = user;
                },
                function(err, status) {
                    main.user = null;
                });
    }]);