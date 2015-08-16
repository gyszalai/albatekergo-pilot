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
                        logger.info("event: ", event.date, event.time);
                        logger.info("registered: ", event.registered);
                        if (!req.user.isAdmin) {
                            eventService.removeEmailAddresses(event);
                        }
                    });
                }
                res.json(events);
            });
        })
        .post(function (req, res) {
            logger.info('events post: ', JSON.stringify(req.body));
            eventService.insert(req.body, function (err, newDoc) {
                logger.info('events insert response: ', newDoc);
                res.json(newDoc);
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
                        eventService.removeEmailAddresses(event);
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
            logger.info("Trying to add new attendee to " + id);
            logger.info("Attendee: ", attendee);
            eventService.addNewAttendee(id, attendee, function(err, result) {
                logger.info("POST /events/:id/attendees, result: " + JSON.stringify(result));
                if (err) {
                    res.json(err);
                } else if (result.status === "OK") {
                    res.json(result.event);
                } else {
                    res.status(404);
                }
            });
        });
        
    router.route('/events/:eventId/attendees/:attendeeId')
        .delete(function (req, res) {
            var eventId = req.params.eventId;
            var attendeeId = req.params.attendeeId;
            logger.info("Trying to remove attendee " + attendeeId + " from " + eventId);
            eventService.removeAttendee(eventId, attendeeId, function(err, result) {
                logger.info("DELETE /events/:eventId/attendees/attendeeId, result: " + JSON.stringify(result));
                if (err) {
                    res.json(err);
                } else if (result.status === "OK") {
                    res.json(result.event);
                } else {
                    res.status(404);
                }
            });
        });

    return router;

};