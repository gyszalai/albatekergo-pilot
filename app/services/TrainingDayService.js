/**
 * Module class constructor.
 * @constructor
 * @param trainingDayDb The NeDB database where trainingdays are stored
 * @author Gyula Szalai <gyszalai@gmail.com>
 */
TrainingDayService = function(trainingDayDb, logger) {
    this.db = trainingDayDb;
    this.defaultMaxAttendees = 11;
    this.logger = logger;
}

/**
 * Return all instances
 * @param callback Callback
 * @author Gyula Szalai <gyszalai@gmail.com>
 */
TrainingDayService.prototype.getAll = function ( callback ) {
    this.db.find({}, function(err, result) {
        if(err || !result) callback(err);
        else callback(null, result);
    });
};

/**
 * Finds an instance in the database and returns it;
 * @param id The unique id of the instance
 * @param callback Callback
 */
TrainingDayService.prototype.find = function(id, callback ){
    this.db.find({_id: id}, function(err, result){
        if(err) callback(err);
        else callback(null, result);
    });
};

/**
 * Inserts a new instance into the database
 * @param trainingDay The instance to be inserted
 * @param callback Callback
 * @author Gyula Szalai <gyszalai@gmail.com>
 */
TrainingDayService.prototype.insert = function( trainingDay, callback ) {
    if (!trainingDay.maxAttendees) {
        trainingDay.maxAttendees = this.defaultMaxAttendees;
    }
    this.db.insert(trainingDay, function(err, saved){
        if(err) callback(err);
        else callback(null, saved);
    });
};

/**
 * Adds a new attendee to the specified trainingday
 * @param trainingDayId The id of the trainingday the attendee to be added to
 * @param attendee The attendee to add
 * @param callback Callback
 * @author Gyula Szalai <gyszalai@gmail.com>
 */
TrainingDayService.prototype.addNewAttendee = function( trainingDayId, attendee, callback ) {

    var db = this.db;
    var logger = this.logger;
    db.findOne({_id: trainingDayId}, function(err, trainingDay) {
       if (trainingDay) {
           logger.info("trainingday found: ", trainingDay);
           if (!(trainingDay.maxAttendees) || (trainingDay.attendees.length < trainingDay.maxAttendees)) {
               db.update({_id: trainingDayId}, {$push: {attendees: attendee}}, function (err, numUpdated, newDoc) {
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
           logger.info("trainingday not found");
           callback();
       }
    });
};

module.exports = TrainingDayService;
