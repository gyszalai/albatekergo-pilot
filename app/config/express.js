/**
 * Express.JS configuration
 */

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

module.exports = function (app, routes, config, logger) {

    // Config
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}))
    app.use('/api', routes);
    //app.use("/", express.static(path.join(config.appRoot, "public")));

    //app.get('/', function (req, res) {
    //    res.redirect('/index.html');
    //});



}