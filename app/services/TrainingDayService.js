'use strict';

/**
 * Module object factory
 * @param trainingDayDb The NeDB database where trainingdays are stored
 * @param logger Logger
 * @author Gyula Szalai <gyszalai@gmail.com>
 */
module.exports = function(trainingDayDb, logger) {
    var db = trainingDayDb;
    var defaultMaxAttendees = 11;
    var logger = logger;
    
    return {
        /**
          * Return all instances
          * @param callback Callback
          * @author Gyula Szalai <gyszalai@gmail.com>
          */
        getAll: function getAll( callback ) {
            db.find({}, function(err, result) {
                if(err || !result) callback(err);
                else callback(null, result);
            });
        },
        /**
          * Finds an instance in the database and returns it;
          * @param id The unique id of the instance
          * @param callback Callback
          */
        find: function find(id, callback ){
            db.find({_id: id}, function(err, result){
                if(err) callback(err);
                else callback(null, result);
            });
        },
        /**
          * Inserts a new instance into the database
          * @param trainingDay The instance to be inserted
          * @param callback Callback
          * @author Gyula Szalai <gyszalai@gmail.com>
          */
       insert: function insert( trainingDay, callback ) {
           if (!trainingDay.maxAttendees) {
               trainingDay.maxAttendees = defaultMaxAttendees;
           }
           db.insert(trainingDay, function(err, saved){
               if(err) callback(err);
               else callback(null, saved);
           });
       },
       /**
        * Adds a new attendee to the specified trainingday
        * @param trainingDayId The id of the trainingday the attendee to be added to
        * @param attendee The attendee to add
        * @param callback Callback
        * @author Gyula Szalai <gyszalai@gmail.com>
        */
       addNewAttendee: function addNewAttendee( trainingDayId, attendee, callback ) {
           db.findOne({_id: trainingDayId}, function(err, trainingDay) {
              if (trainingDay) {
                  logger.info("trainingday found: ", trainingDay);
                  if (!(trainingDay.maxAttendees) || (trainingDay.attendees.length < trainingDay.maxAttendees)) {
                      db.update({_id: trainingDayId}, {$push: {attendees: attendee}}, function (err, numUpdated, newDoc) {
                          logger.info("addNewAttendee error: ", err);
                          if (err) callback(err);
                          else callback(null, numUpdated);
                      });
                  } else {
                      logger.info("maxAttendees reached");
                      callback({result: 'NO_MORE_ROOM'});
                  }
              } else if(err) {
                  logger.info("addNewAttendee, error", err);
                  callback(err);
              } else {
                  logger.info("trainingday not found");
                  callback();
              }
           });
       },
       /**
        * Removes all attendees' e-mail addresses from the given training day
        * @param {type} trainingDay The training day
        */
        removeEmailAddresses: function removeEmailAddresses(trainingDay) {
            if (trainingDay.attendees) {
                trainingDay.attendees.forEach(function(attendee) {
                    attendee.email = null;
                });
            }
        }
       
    };
};
