UserService = function(userDb, logger) {
    this.db = userDb;
    this.logger = logger;
}

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
 * Inserts a new instance into the database
 * @param user The instance to be inserted
 * @param callback Callback
 * @author Gyula Szalai <gyszalai@gmail.com>
 */
UserService.prototype.insert = function( user, callback ) {
    this.db.insert(user, function(err, saved){
        if(err) callback(err);
        else callback(null, saved);
    });
};

module.exports = UserService;
