/**
 * Created by gyszalai on 10/04/15.
 */
var albatekergoApp = angular.module('AlbatekergoMain', ['angular', 'mgcrea.ngStrap'])

albatekergoApp.config(function ($navbarProvider) {
    angular.extend($navbarProvider.defaults, {
        activeClass: 'in'
    });
});

albatekergoApp.controller("MainController", function () {
    this.user = {
        fullName: "Teszt felhasználó"
    };
});