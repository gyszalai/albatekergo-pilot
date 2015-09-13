var express = require('express');
var router = express.Router();
var _ = require('lodash');

module.exports = function (config, logger, eventService, trainerService) {

    /**  
     * Middleware to check if a user is logged in
     * 
     * @param {Request} req HTTP request
     * @param {Response} res HTTP response
     * @param {function} next Next callback
     */
    function isLoggedIn(req, res, next) {
        if (config.authDisabled) {
            next();
        } else {
            if (req.isAuthenticated()) { 
                return next(); 
            } else {
                res.status(401).send({reason: "Not authenticated"});
            }
        }
    }
    
    // All routes need authenticated user
    router.use(isLoggedIn);

    // Get all events starting from a given day
    router.route('/events')
        .get(function (req, res) {
            var startDay = req.query.startDay;
            logger.debug("/events: startDay: " + startDay);
            if (startDay) {
                eventService.getAll(startDay, function(err, events) {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        if (events) {
                            events.forEach(function(event) {
                                event.registered = eventService.isUserRegisteredToEvent(event, req.user.email);
                                logger.debug("event: ", event.date, event.time);
                                logger.debug("registered: ", event.registered);
                                removeAttendeesFromEvent(event);
                            });
                        }
                        res.status(200).send(events);
                    }
                });
            } else {
                res.status(400).send({reason: "startDay parameter missing"});
            }
        });

    // Get an event
    router.route('/events/:id')
        .get(function (req, res) {
            eventService.find(req.params.id, function(err, event) {
                logger.info("event found: ", event);
                if (err) {
                    res.status(500).send(err);
                } else if (event) {
                    event.registered = eventService.isUserRegisteredToEvent(event, req.user.email);
                    if (!req.user.isAdmin) {
                        removeAttendeesFromEvent(event);
                    }
                    res.status(200).send(event);
                } else {
                    res.status(404).send({reason: "Not found"});
                }
            });
        });

    // Add event attendee
    router.route('/events/:id/attendees')
        .post(function (req, res) {
            var id = req.params.id;
            var attendee = _.pick(req.body, ["email", "name"]);            
            if (req.user.email !== attendee.email) {
                var statusText = "User "+req.user.email+" not allowed to register attendee: " + attendee.email;
                logger.warn(statusText);
                res.status(401).send({reason: statusText});
            } else {
                logger.info("Trying to add new attendee "+attendee.email+" to " + id);
                logger.info("Attendee: ", attendee);
                eventService.addNewAttendee(id, attendee, function(err, result) {
                    logger.info("POST /events/:id/attendees, result: " + JSON.stringify(result));
                    if (err) {
                        res.status(500).send(err);
                    } else if (result.status === "OK") {
                        removeAttendeesFromEvent(result.event);
                        res.status(200).send(result.event);
                    } else {
                        res.status(404).send({reason: "Not found"});
                    }
                });
            }
        });
        
    // Delete event attendee
    router.route('/events/:eventId/attendees/:attendeeId')
        .delete(function (req, res) {
            var eventId = req.params.eventId;
            var attendeeId = req.params.attendeeId;
            
            if (req.user.email !== attendeeId) {
                var statusText = "User "+req.user.email+" not allowed to unregister attendee: " + attendeeId;
                logger.warn(statusText);
                res.status(401).send({reason: statusText});
            } else {
                logger.info("Trying to remove attendee " + attendeeId + " from " + eventId);
                eventService.removeAttendee(eventId, attendeeId, function(err, result) {
                    logger.info("DELETE /events/:eventId/attendees/attendeeId, result: " + JSON.stringify(result));
                    if (err) {
                        res.status(500).send(err);
                    } else if (result.status === "OK") {
                        removeAttendeesFromEvent(result.event);
                        res.status(200).send(result.event);
                    } else {
                        res.status(404).send({reason: "Not found"});
                    }
                });
            }
        });
        
    // Trainers
    router.route('/trainers')
        .get(function (req, res) {
            trainerService.getAll(function(err, trainers) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send(trainers);
                }
            });
        });

    /**
     * Removes attendees property from the given event
     * 
     * @param {Event} event The event
     */
    function removeAttendeesFromEvent(event) {
        if (event.attendees) {
            event.numAttendees = event.attendees.length;
            delete event.attendees;
        } else {
            event.numAttendees = 0;
        }
    }
    
    return router;
};