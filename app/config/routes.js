var express = require('express');
var router = express.Router();

module.exports = function (config, logger, trainingDayService) {

    /**  Middleware to check if a user is logged in */
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) { 
            return next(); 
        } else {
            res.redirect('/');
        }
    }

    router.use(isLoggedIn);

    router.route('/trainingdays')
        .get(function (req, res) {
            trainingDayService.getAll(function(err, trainingDays) {
                res.json(trainingDays);
            });
        })
        .post(function (req, res) {
            logger.info('trainingdays post: ', JSON.stringify(req.body));
            trainingDayService.insert(req.body, function (err, newDoc) {
                logger.info('trainingdays insert response: ', newDoc);
                res.json(newDoc);
            });
        });

    router.route('/trainingdays/:id')
        .get(function (req, res) {
            trainingDayService.find(req.params.id, function(err, trainingDay) {
                logger.info("trainingday found: ", trainingDay);
                if (err) {
                    res.json(err);
                } else if (trainingDay) {
                    res.json(trainingDay);
                } else {
                    res.status(404);
                }
            });
        });

    router.route('/trainingdays/:id/attendees')
        .post(function (req, res) {
            var id = req.params.id;
            var attendee = req.body;
            logger.info("Trying to add new attendee to " + id);
            logger.info("Attendee: ", attendee);
            trainingDayService.addNewAttendee(id, attendee, function(err, numUpdated) {
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