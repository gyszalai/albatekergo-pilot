var express = require('express');
var router = express.Router();

var _ = require("lodash");
var Indicative = new(require("indicative"));

module.exports = function (config, logger, eventService) {

    /**  
     * Middleware to check if a user is logged in and has admin roles
     * 
     * @param {Request} req HTTP request
     * @param {Response} res HTTP response
     * @param {function} next Next callback
     */
    function isLoggedInAdmin(req, res, next) {
        if (config.authDisabled) {
            next();
        } else {
            if (req.isAuthenticated() && req.user.isAdmin) {
                return next(); 
            } else {
                res.status(401).send({reason: 'Not authenticated'});
            }
        }
    }
    
    /**
     * Event object validation middleware
     * 
     * @param {Request} req HTTP request
     * @param {Response} res HTTP response
     * @param {function} next Next callback
     */
    function validateEvent(req, res, next) {
        console.log("*** validating event object: " + JSON.stringify(req.body));
        
        var rules = {
            date: 'required|date_format:YYYY-MM-DD',
            time: 'required|date_format:HH:mm',
            trainer: 'required|string|min:2|max:20',
            maxAttendees: 'required|integer|above:1|under:17'
        };

        Indicative
                .validate(rules, req.body)
                .then(function (success) {
                    logger.debug("event object validation successful");
                    next();
                })
                .catch(function (errors) {
                    logger.debug("validation errors: " + JSON.stringify(errors));
                    res.status(400).send({reason: "Validation failed", errors: errors});
                });
    }
    
    // All routes need authenticated admin user
    router.use(isLoggedInAdmin);
    
    router.route('/events')
        // Get all events starting from a given day
        .get(function (req, res) {
            var startDay = req.query.startDay;
            if (startDay) {
                logger.debug("/admin/events: startDay: " + startDay);
                eventService.getAll(startDay, function(err, events) {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        res.status(200).send(events);
                    }
                });
            } else {
                res.status(400).send({reason: "startDay parameter missing"});
            }
        })
        // Create a new event
        .post(validateEvent, function (req, res) {
            var event = _.pick(req.body, ["date", "time", "trainer", "maxAttendees"]);
            event.attendees = [];
            logger.info('events post: ', JSON.stringify(event));
            eventService.insert(event, function (err, newEvent) {
                logger.info('events insert response: ', newEvent);
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(201).send(newEvent);
                }
            });
        });

    // Delete an event
    router.route('/events/:id')
        .delete(function (req, res) {
            var eventId = req.params.id;
            logger.info("deleting event: ", eventId);
            eventService.remove(eventId, function(err, numRemoved) {
                if (err) {
                    logger.info("event delete error: ", err);
                    res.status(500).send(err);
                } else if (numRemoved > 0) {
                    res.status(204).send({numRemoved: numRemoved});
                } else {
                    res.status(404).send({reason: "Not found"});
                }
            });
        });

    return router;

};