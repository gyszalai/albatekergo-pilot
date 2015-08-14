angular.module('AlbatekergoMain').service('UserService', function($http, $log) {

    this.getUser = function() { 
        return $http.get("/profile");
    };
    
});