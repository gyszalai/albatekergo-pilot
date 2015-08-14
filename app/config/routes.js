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
                logger.info("events found: ", event);
                if (err) {
                    res.json(err);
                } else if (event) {
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
            var attendee = req.body;
            logger.info("Trying to add new attendee to " + id);
            logger.info("Attendee: ", attendee);
            eventService.addNewAttendee(id, attendee, function(err, numUpdated) {
                logger.info("Message sent: ", numUpdated);
                if (err) {
                    res.json(err);
                } else if (numUpdated > 0) {
                    res.json({result: 'SUCCESS', numUpdated: numUpdated});
                } else {
                    res.status(404);
                }
            });
        });

    return router;

};