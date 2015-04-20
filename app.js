/**
 * Example REST API + simple web server
 * User: Gyula Szalai <gyszalai@gmail.com>
 * Date: 23/09/13
 */

var express = require('express');
var path = require('path');
//var html = require('html');
var logger = require('winston');

var env = process.env.NODE_ENV || 'development';
var config = require('./app/config/config')[env];

logger.info("Env: " + env);

var Datastore = require('nedb');

var TrainingDayProvider = require('./app/providers/TrainingDayProvider');

var db = new Datastore({ filename: config.db, autoload: true });
var trainingDayProvider = new TrainingDayProvider(db, logger);

var app = express();

var routes = require('./app/config/routes')(config, logger, trainingDayProvider);

require('./app/config/express')(app, routes, config, logger);

var port = 8100;
logger.info("Listening on: " + port);
app.listen(port);

