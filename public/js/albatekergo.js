/**
 * Created by gyszalai on 10/04/15.
 */
var albatekergoApp = angular.module('AlbatekergoMain', ['ngRoute', 'ngAnimate', 'mgcrea.ngStrap']);

albatekergoApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/Home', {
            controller: 'HomeController',
            controllerAs: 'home',
            templateUrl: 'partials/Home.html'
        })
        .when('/Login', {
            controller: 'LoginController',
            templateUrl: 'partials/Login.html'
        })
        .when('/LoginFailed', {
            controller: 'LoginFailedController',
            template: '<div>Sikertelen belépés</div>'
        })
        .when('/Logout', {
            controller: 'LogoutController',
            template: '<div></div>' // it does not have a view, but angular requires to have a template
        })
        .when('/Calendar', {
            controller: 'CalendarController',
            templateUrl: 'partials/Calendar.html'
        })
        .when('/Week', {
            controller: 'WeekController',
            templateUrl: 'partials/Week.html'
        })
        .when('/WeekAdmin', {
            controller: 'WeekAdminController',
            templateUrl: 'partials/WeekAdmin.html'
        })
        .otherwise({
            redirectTo: '/Home'
        });

}]);

albatekergoApp.config(function ($navbarProvider) {
    angular.extend($navbarProvider.defaults, {
        activeClass: 'in'
    });
});

albatekergoApp.config(function () {
    moment.locale('en', {
        week : {
          dow : 1 // Monday is the first day of the week
        }
      });
      
    moment.locale('hu');
});


