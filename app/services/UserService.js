/**
 * Module class constructor.
 * @constructor
 * @param userDb The NeDB database where users are stored
 * @author Gyula Szalai <gyszalai@gmail.com>
 */
UserService = function(userDb, logger) {
    this.db = userDb;
    this.logger = logger;
};

/**
 * Return all instances
 * @param callback Callback
 * @author Gyula Szalai <gyszalai@gmail.com>
 */
UserService.prototype.getAll = function ( callback ) {
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
UserService.prototype.find = function(id, callback ){
    this.db.find({_id: id}, function(err, result){
        if(err) callback(err);
        else callback(null, result);
    });
};

/**
 * Inserts a new instance into the database if it does not exist yet, otherwise updates the existing instance
 * 
 * @param user The instance to be inserted/updated
 * @param callback Callback
 * @author Gyula Szalai <gyszalai@gmail.com>
 */
UserService.prototype.insertOrUpdate = function( user, callback ) {
    var logger = this.logger;
    var db = this.db;
    this.db.find({_id: user._id}, function(err, existingUser) {
        if (!existingUser) {
            logger.debug("User does not exist yet, inserting");
            db.insert(user, function(err, saved){
                if(err) callback(err);
                else callback(null, saved);
            });
        } else {
            logger.debug("User already exists, updating");
            db.update({_id: user._id}, user, function(err, saved){
                if(err) callback(err);
                else callback(null, user);
            });
        }
    });
    
};

module.exports = UserService;
