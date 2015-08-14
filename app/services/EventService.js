'use strict';

var moment = require("moment");

/**
 * Module object factory
 * @param eventDb The NeDB database where events are stored
 * @param logger Logger
 * @author Gyula Szalai <gyszalai@gmail.com>
 */
module.exports = function(eventDb, logger) {
    var db = eventDb;
    var defaultMaxAttendees = 15;
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
          * @param event The instance to be inserted
          * @param callback Callback
          * @author Gyula Szalai <gyszalai@gmail.com>
          */
       insert: function insert( event, callback ) {
           if (!event.maxAttendees) {
               event.maxAttendees = defaultMaxAttendees;
           }
           db.insert(event, function(err, saved){
               if(err) callback(err);
               else callback(null, saved);
           });
       },
       /**
        * Adds a new attendee to the specified event
        * @param eventId The id of the event the attendee to be added to
        * @param attendee The attendee to add
        * @param callback Callback
        * @author Gyula Szalai <gyszalai@gmail.com>
        */
       addNewAttendee: function addNewAttendee( eventId, attendee, callback ) {
           db.findOne({_id: eventId}, function(err, event) {
              if (event) {
                  logger.info("event found: ", event);
                  if (!(event.maxAttendees) || (event.attendees.length < event.maxAttendees)) {
                      db.update({_id: eventId}, {$push: {attendees: attendee}}, function (err, numUpdated, newDoc) {
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
                  logger.info("event not found");
                  callback();
              }
           });
       },
       /**
        * Removes all attendees' e-mail addresses from the given event
        * @param {type} event The event
        */
        removeEmailAddresses: function removeEmailAddresses(event) {
            if (event.attendees) {
                event.attendees.forEach(function(attendee) {
                    attendee.email = null;
                });
            }
        }
       
    };
};
