'use strict';

/**
 * Module object factory.
 * @param userDb The NeDB database where users are stored
 * @param adminDb The NeDB database where admin users are stored
 * @param logger Logger
 * @author Gyula Szalai <gyszalai@gmail.com>
 */
module.exports = function(userDb, adminDb, logger) {
    
    return {

        /**
         * Return all instances
         * @param callback Callback
         * @author Gyula Szalai <gyszalai@gmail.com>
         */
        getAll: function getAll( callback ) {
            userDb.find({}, function(err, result) {
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
            userDb.findOne({_id: id}, function(err, user){
                logger.debug("UserService.find, err: " + err + ", user: " + user);
                if(err || !user) {
                    callback(err);
                }
                else {
                    logger.debug("User found: " + user);
                    adminDb.find({_id: user.email}, function(err, adminUser) {
                        if (err) {
                            callback(err);
                        } else {
                            if (adminUser) {
                                logger.info("User is admin: " + user);
                                user.isAdmin = true;
                            }
                            callback(null, user);
                        }
                    });
                }
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
            userDb.findOne({_id: user._id}, function(err, existingUser) {
                logger.debug("UserService.insertOrUpdate, err: " + err + ", existingUser: " + existingUser);
                if (!existingUser) {
                    logger.debug("User does not exist yet, inserting");
                    userDb.insert(user, function(err, saved){
                        if(err) callback(err);
                        else callback(null, saved);
                    });
                } else {
                    logger.debug("User already exists, updating");
                    userDb.update({_id: user._id}, user, function(err, numUpdated){
                        if(err) callback(err);
                        else callback(null, user);
                    });
                }
            });
        }
    };
};
