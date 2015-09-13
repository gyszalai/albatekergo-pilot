'use strict';

/**
 * Example REST API + simple web server
 * User: Gyula Szalai <gyszalai@gmail.com>
 * Date: 2015-05-01
 */

var express = require('express');
var path = require('path');
var winston = require('winston');

var env = process.env.NODE_ENV || 'development';
var config = require('./server/config/config')[env];

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ level: 'debug' })
    ]
  });

logger.info("Env: " + env);

var Datastore = require('nedb');

var eventDb = new Datastore({ filename: config.dbRoot + '/event.db', autoload: true });
var userDb = new Datastore({ filename: config.dbRoot + '/user.db', autoload: true });
var adminDb = new Datastore({ filename: config.dbRoot + '/admin.db', autoload: true });
var trainerDb = new Datastore({ filename: config.dbRoot + '/trainer.db', autoload: true });

var eventService = require('./server/services/EventService')(eventDb, logger);
var userService = require('./server/services/UserService')(userDb, adminDb, logger);
var trainerService = require('./server/services/UserService')(trainerDb, logger);

var app = express();
var routes = require('./server/config/routes')(config, logger, eventService, trainerService);
var routes_admin = require('./server/config/routes.admin')(config, logger, eventService);

var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8100;

require('./server/config/express')(server_ip_address, server_port, app, routes, routes_admin, env, config, userService, logger);

logger.info("Listening on: " + server_port);
app.listen(server_port, server_ip_address);
