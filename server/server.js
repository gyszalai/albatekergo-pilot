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
var config = require('./config/config')[env];

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

var eventService = require('./services/EventService')(eventDb, logger);
var userService = require('./services/UserService')(userDb, adminDb, logger);

var app = express();
var routes = require('./config/routes')(config, logger, eventService);
var routes_admin = require('./config/routes.admin')(config, logger, eventService);

var port = 8100;
require('./config/express')(port, app, routes, routes_admin, env, config, userService, logger);

logger.info("Listening on: " + port);
app.listen(port);
