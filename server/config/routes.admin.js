var express = require('express');
var router = express.Router();

module.exports = function (config, logger, eventService) {

    /**  Middleware to check if a user is logged in and has admin roles */
    function isLoggedInAdmin(req, res, next) {
        if (req.isAuthenticated() && req.user.isAdmin) {
            return next(); 
        } else {
            res.status(401).send('Not authenticated');
        }
    }
    
    router.use(isLoggedInAdmin);
    
    router.route('/events')
        .get(function (req, res) {
            eventService.getAll(function(err, events) {
                if (events) {
                    events.forEach(function(event) {
                        event.registered = eventService.isUserRegisteredToEvent(event, req.user.email);
                        logger.info("event: ", event.date, event.time);
                        logger.info("registered: ", event.registered);
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
        .delete(function (req, res) {
            var eventId = req.params.id;
            logger.info("deleting event: ", eventId);
            eventService.remove(eventId, function(err, numRemoved) {
                if (err) {
                    logger.info("event delete error: ", err);
                    res.json(err);
                } else if (numRemoved > 0) {
                    res.json({status: "OK", numRemoved: numRemoved});
                } else {
                    res.status(404);
                }
            });
        });

    return router;

};