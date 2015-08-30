'use strict';

/**
 * Module object factory.
 * @param trainerDb The NeDB database where trainers are stored
 * @param logger Logger
 * @author Gyula Szalai <gyszalai@gmail.com>
 */
module.exports = function(trainerDb, logger) {
    
    return {

        /**
         * Return all instances
         * @param callback Callback
         * @author Gyula Szalai <gyszalai@gmail.com>
         */
        getAll: function getAll( callback ) {
            trainerDb.find({}, function(err, result) {
                if(err || !result) callback(err);
                else callback(null, result);
            });
        }
        
    };
};
