'use strict';

/**
 * Module object factory.
 * @param userDb The NeDB database where users are stored
 * @param logger Logger
 * @author Gyula Szalai <gyszalai@gmail.com>
 */
module.exports = function(userDb, logger) {
    var db = userDb;
    var logger = logger;
    
    return {

        /**
         * Return all instances
         * @param callback Callback
         * @author Gyula Szalai <gyszalai@gmail.com>
         */
        getAll: function getAll( callback ) {
            db.find({}, function(err, result) {
                if(err || !result) callback(err);
                else callback(null, result);
            });
        },

        /**
         * Finds an instance in the database and returns it;
         * @param id The unique id of the instance
         * @param callback Callback
         */
        find: function find(id, callback ){
            db.find({_id: id}, function(err, result){
                if(err) callback(err);
                else callback(null, result);
            });
        },

        /**
         * Inserts a new instance into the database if it does not exist yet, otherwise updates the existing instance
         * 
         * @param user The instance to be inserted/updated
         * @param callback Callback
         * @author Gyula Szalai <gyszalai@gmail.com>
         */
        insertOrUpdate: function insertOrUpdate( user, callback ) {
            db.find({_id: user._id}, function(err, existingUser) {
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
        }
    };
};
