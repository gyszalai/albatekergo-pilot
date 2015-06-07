'use strict';

/**
 * Express.JS configuration
 */
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = function (port, app, routes, config, userService, logger) {

    passport.use(new GoogleStrategy({
            clientID: config.googleClientId,
            clientSecret: config.googleClientSecret,
            callbackURL: 'http://localhost:'+port+'/auth/google/callback'
        },
        function(token, refreshToken, profile, done) {

            logger.info("profile: ", profile);
            logger.info("User accessToken: ", token);

            var user = {_id: profile.emails[0].value, displayName: profile.displayName};
            logger.info("User to be saved: ", user);
            userService.insertOrUpdate(user, function(err, user) {
                logger.info("after user insert: ", err, user);
                return done(err, user);
            });

        }
    ));
    
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        logger.warn("serializeUser, user:", user);
        done(null, user._id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        logger.warn("deserializeUser, id:", id);
        userService.find(id, function(err, user) {
            done(err, user);
        });
    });
    
    // Middlewares
    app.use("/", express.static(path.join(config.appRoot, "public")));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(cookieSession({ keys: ['abc1234bac123', 'bbaacceeffgghh'] }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use('/profile', isLoggedIn);
    app.use('/api', routes);
    
    // Root URL redirect to index.html
    app.get('/', function (req, res) {
        res.redirect('/index.html');
    });

    // Google auth URL
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // Google auth callback URL.
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '#/Calendar', 
            failureRedirect: '#/LoginFailed' 
        })
    );

    // Show user profile
    app.get('/profile', function(req, res) {
        logger.info("Sending user: ", JSON.stringify(req.user));
        res.send(req.user);
    });

    /**  Middleware to check if a user is logged in */
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) { 
            return next(); 
        } else {
            res.status(401).send('Not authenticated');
        }
    }

};