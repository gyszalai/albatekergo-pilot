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
          * Finds all instances
          * @param callback Callback (err, result)
          * @author Gyula Szalai <gyszalai@gmail.com>
          */
        getAll: function getAll(startDay, callback ) {
            db.find({date: {$gte: startDay}}).sort({date: 1, time: 1}).exec(function(err, result) {
                if(err || !result) callback(err);
                else callback(null, result);
            });
        },
        /**
          * Finds an instance in the database
          * @param id The unique id of the instance
          * @param callback Callback (err, result)
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
          * @param callback Callback (err, insertedDoc)
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
         * Finds and removes an instance from the database
         * @param id The unique id of the instance
         * @param callback Callback (err, numRemoved)
         */
       remove: function remove(id, callback ){
            db.remove({_id: id}, function(err, numRemoved){
                if(err) {
                    callback(err);
                }
                else {
                    callback(null, numRemoved);
                };
            });
        },
       /**
        * Adds a new attendee to the specified event
        * @param eventId The id of the event the attendee to be added to
        * @param attendee The attendee to add
        * @param callback Callback (null, {status, event})
        * @author Gyula Szalai <gyszalai@gmail.com>
        */
        addNewAttendee: function addNewAttendee(eventId, attendee, callback) {
            var eventService = this;
            db.findOne({_id: eventId}, function (err, event) {
                if (event) {
                    logger.info("event found: ", event);
                    if (!(event.maxAttendees) || (event.attendees.length < event.maxAttendees)) {

                        if (eventService.isUserRegisteredToEvent(event, attendee.email)) {
                            logger.info("already registered");
                            callback({status: 'ALREADY_REGISTERED'});
                        } else {
                            db.update({_id: eventId}, {$push: {attendees: attendee}}, function (err, numUpdated, newDoc) {
                                logger.info("addNewAttendee error: ", err);
                                if (err) {
                                    callback(err);
                                } else {
                                    db.findOne({_id: eventId}, function (err, event) {
                                        if (err) {
                                            callback(err);
                                        } else {
                                            event.registered = true;
                                            callback(null, {status: "OK", event: event});
                                        }
                                    });
                                }
                            });
                        }
                    } else {
                        logger.info("maxAttendees reached");
                        callback({status: 'NO_MORE_ROOM'});
                    }
                } else if (err) {
                    logger.info("addNewAttendee, error", err);
                    callback(err);
                } else {
                    logger.info("event not found");
                    callback();
                }
            });
        },
        /**
        * Removes an attendee to the specified event
        * @param eventId The id of the event the attendee to be added to
        * @param attendeeEmail The email address of the attendee
        * @param callback Callback
        * @author Gyula Szalai <gyszalai@gmail.com>
        */
        removeAttendee: function removeAttendee(eventId, attendeeEmail, callback) {
            logger.info("removeAttendee");
            var eventService = this;
            db.findOne({_id: eventId}, function (err, event) {
                if (event) {
                    logger.info("event found: " + JSON.stringify(event));
                    if (!eventService.isUserRegisteredToEvent(event, attendeeEmail)) {
                        logger.info("not registered");
                        callback({status: 'NOT_REGISTERED'});
                    } else {
                        db.update({_id: eventId}, {$pull: {attendees: {email: attendeeEmail} }}, function (err, numUpdated, newDoc) {
                            logger.info("removeAttendee error: ", err);
                            if (err) {
                                callback(err);
                            } else {
                                db.findOne({_id: eventId}, function (err, event) {
                                    if (err) {
                                        callback(err);
                                    } else {
                                        event.registered = false;
                                        callback(null, {status: "OK", event: event});
                                    }
                                });
                            }
                        });
                    }
                    
                } else if (err) {
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
        * @param event The event
        */
        removeEmailAddresses: function removeEmailAddresses(event) {
            if (event.attendees) {
                event.attendees.forEach(function(attendee) {
                    attendee.email = null;
                });
            }
        },
        /**
         * Check if a given user is already registered to the given event
         * @param {type} event The event
         * @param {type} email The e-mail address of the user
         * @returns true, if the user is already registered to the event
         */
        isUserRegisteredToEvent: function isUserRegisteredToEvent(event, email) {
            if (event.attendees) {
                return event.attendees.some(function(attendee) {
                    return (attendee.email === email);
                });
            }
            return false;
        }
       
    };
};
