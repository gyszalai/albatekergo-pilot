var express = require('express');
var router = express.Router();

module.exports = function (config, logger, eventService) {

    /**  Middleware to check if a user is logged in */
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) { 
            return next(); 
        } else {
            res.status(401).send('Not authenticated');
        }
    }
    
    router.use(isLoggedIn);

    router.route('/events')
        .get(function (req, res) {
            eventService.getAll(function(err, events) {
                if (events) {
                    events.forEach(function(event) {
                        event.registered = eventService.isUserRegisteredToEvent(event, req.user.email);
                        logger.debug("event: ", event.date, event.time);
                        logger.debug("registered: ", event.registered);
                        removeAttendeesFromEvent(event);
                    });
                }
                res.json(events);
            });
        });

    router.route('/events/:id')
        .get(function (req, res) {
            eventService.find(req.params.id, function(err, event) {
                logger.info("event found: ", event);
                if (err) {
                    res.json(err);
                } else if (event) {
                    event.registered = eventService.isUserRegisteredToEvent(event, req.user.email);
                    if (!req.user.isAdmin) {
                        removeAttendeesFromEvent(event);
                    }
                    res.json(event);
                } else {
                    res.status(404);
                }
            });
        });

    router.route('/events/:id/attendees')
        .post(function (req, res) {
            var id = req.params.id;
            var attendee = {
                email: req.body.email, 
                name: req.body.displayName
            };
            
            if (req.user.email !== attendee.email) {
                var statusText = "User "+req.user.email+" not allowed to register attendee: " + attendee.email;
                logger.warn(statusText);
                res.status(401);
                res.send({status: "ERROR", reason: statusText});
            } else {
                logger.info("Trying to add new attendee "+attendee.email+" to " + id);
                logger.info("Attendee: ", attendee);
                eventService.addNewAttendee(id, attendee, function(err, result) {
                    logger.info("POST /events/:id/attendees, result: " + JSON.stringify(result));
                    if (err) {
                        res.json(err);
                    } else if (result.status === "OK") {
                        removeAttendeesFromEvent(result.event);
                        res.json(result.event);
                    } else {
                        res.status(404);
                    }
                });
            }
        });
        
    router.route('/events/:eventId/attendees/:attendeeId')
        .delete(function (req, res) {
            var eventId = req.params.eventId;
            var attendeeId = req.params.attendeeId;
            
            if (req.user.email !== attendeeId) {
                var statusText = "User "+req.user.email+" not allowed to unregister attendee: " + attendeeId;
                logger.warn(statusText);
                res.status(401);
                res.send({status: "ERROR", reason: statusText});
            } else {
                logger.info("Trying to remove attendee " + attendeeId + " from " + eventId);
                eventService.removeAttendee(eventId, attendeeId, function(err, result) {
                    logger.info("DELETE /events/:eventId/attendees/attendeeId, result: " + JSON.stringify(result));
                    if (err) {
                        res.json(err);
                    } else if (result.status === "OK") {
                        removeAttendeesFromEvent(result.event);
                        res.json(result.event);
                    } else {
                        res.status(404);
                    }
                });
            }
        });

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