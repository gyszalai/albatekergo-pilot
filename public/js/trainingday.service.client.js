/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

angular.module('AlbatekergoMain').service('TrainingDayService', function($http, $log) {

    this.getTrainingDays = function() { 
        return $http.get("/api/trainingdays");
    };
    
});