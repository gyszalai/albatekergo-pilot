var express = require('express');
var router = express.Router();

//var trainingday1 = {
//    date: '2015-04-11',
//    attendees: [
//        {name: 'Kovács József', email: 'kovacsjozsef@gmail.com'},
//        {name: 'Nagy János', email: 'nagyjanos@gmail.com'},
//    ]
//};
//var trainingday2 = {
//    date: '2015-04-12',
//    attendees: [
//        {name: 'Kovács Péter', email: 'kovacspater@gmail.com'},
//        {name: 'Nagy Istvány', email: 'nagyistvan@gmail.com'},
//    ]
//};
//
//var trainingdays = [trainingday1, trainingday2];

module.exports = function (config, logger, trainingDayProvider) {

    router.route('/trainingdays')
        .get(function (req, res) {
            trainingDayProvider.getAll(function(err, trainingDays) {
                res.json(trainingDays);
            });
        })
        .post(function (req, res) {
            logger.info('trainingdays post: ', JSON.stringify(req.body));
            trainingDayProvider.insert(req.body, function (err, newDoc) {
                logger.info('trainingdays insert response: ', newDoc);
                res.json(newDoc);
            });
        });

    router.route('/trainingdays/:id')
        .get(function (req, res) {
            trainingDayProvider.find(req.params.id, function(err, trainingDay) {
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
            logger.info("Attendee: ", attendee)
            trainingDayProvider.addNewAttendee(id, attendee, function(err, numUpdated) {
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