'use strict';

/**
 * Example REST API + simple web server
 * User: Gyula Szalai <gyszalai@gmail.com>
 * Date: 2015-05-01
 */

var express = require('express');
var path = require('path');
var logger = require('winston');

var env = process.env.NODE_ENV || 'development';
var config = require('./app/config/config')[env];

logger.info("Env: " + env);

var Datastore = require('nedb');

var trainingDayDb = new Datastore({ filename: config.dbRoot + '/trainingDay.db', autoload: true });
var userDb = new Datastore({ filename: config.dbRoot + '/user.db', autoload: true });

var trainingDayService = require('./app/services/TrainingDayService')(trainingDayDb, logger);
var userService = require('./app/services/UserService')(userDb, logger);

var app = express();
var routes = require('./app/config/routes')(config, logger, trainingDayService);

var port = 8100;
require('./app/config/express')(port, app, routes, config, userService, logger);

logger.info("Listening on: " + port);
app.listen(port);
