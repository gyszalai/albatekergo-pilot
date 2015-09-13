var moment = require("moment");
var winston = require('winston');
var assert = require("assert");

var config = require('../config/config')['ci'];
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ level: 'debug' })
    ]
  });

var Datastore = require('nedb');
var eventDb = new Datastore({ filename: config.dbRoot + '/event.db', autoload: true });

var EventService = require("../services/EventService")(eventDb, logger);

var now = moment();

describe('EventService', function () {

    describe('isUnregisteringAllowed', function () {
        it('should return false if there is less than 5 hours left until the start of the given event', function () {
            var eventDateTime = moment().add(4, 'h');
            var event = {
                date: eventDateTime.format('YYYY-MM-DD'),
                time: eventDateTime.format('HH:mm')
            };
            var allowed = EventService.isUnregisteringAllowed(event);
            assert.equal(allowed, false);            
        });
        
        it('should return true if there is more than 5 hours left until the start of the given event', function () {
            var eventDateTime = moment().add(301, 'm');
            var event = {
                date: eventDateTime.format('YYYY-MM-DD'),
                time: eventDateTime.format('HH:mm')
            };
            var allowed = EventService.isUnregisteringAllowed(event);
            assert.equal(allowed, true);
        });
        
        
    });
});




