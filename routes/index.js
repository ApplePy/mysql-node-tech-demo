var express = require('express');
var router = express.Router();
var db_cmds = require('../db-functions/db_cmds');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var getUserID = function(req) {
    var jsoncookie = cookieParser.JSONCookie(req.cookies);
    if (jsoncookie != undefined)
        return jsoncookie.userid;
    else return undefined;
};

// Redirect if logged in
var loggedInRedirect = function(res) {
    var userid = getUserID(res);
    if (userid != undefined) {
        res.redirect('/welcome');
        return true;
    }
    else {
        return false;
    }
};

/* GET home page. */
router.get('/', function(req, res, next) {
    var cb = function() {
        res.render('index', {title: 'Apollo'});
    };

    // Redirect if logged in
    if (!loggedInRedirect(res)) cb();
});

router.route('/login')
    .get(function (req, res) {
        var cb = function (suggestedTrack) {
            res.render('login', {title: 'Log In'});
        };

        // Redirect if logged in
        if (!loggedInRedirect(res)) cb();
    })
    .post(function (req, res) {
        var username = req.body.username;
        var password = req.body.password;

        // Set cookie on success, then redirect to welcome
        var successCallback = function(userid) {
            res.cookie("apollo", "{userid: "+ userid +"}", {overwrite: true, maxAge: 1000 * 60 * 60 * 24}); // 24 hour expiry
            res.redirect('/welcome');
        };

        // Handle bad credentials
        var failureCallback = function() {/*TODO: fill in*/};

        // Check credentials
        db_cmds.loginUser(username, password, successCallback, failureCallback);
    });

router.route('/create-user')
    .get(function (req, res) {
        var cb = function (suggestedTrack) {
            res.render('create-user', {title: 'Create User'});
        };

        // Redirect if logged in
        if (!loggedInRedirect(res)) cb();
    })
    .post(function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var firstname = req.body.prefFirstname;
        var lastname = req.body.lastName;
        console.log(username);
        // Set cookie on success, then redirect to welcome
        var successCallback = function(userid) {
            res.cookie("apollo", "{userid: "+ userid +"}", {overwrite: true, maxAge: 1000 * 60 * 60 * 24}); // 24 hour expiry
            res.redirect('/welcome');
        };

        // Handle bad create
        var failureCallback = function(message) {/*TODO: fill in*/};

        // Check credentials
        db_cmds.createUser(username, password, firstname, lastname, successCallback, failureCallback);
    });

router.route('/welcome').get(function(req, res){
    var cb = function(suggestedTrack) {
        res.render('welcome', {title: 'Welcome', suggestedTrack: suggestedTrack})
    };

    var userid = getUserID(res);
    db_cmds.suggestedTrack(userid, cb);
});

router.route('/settings').get(function(req, res){
    var cb = function(suggestedTrack) {
        res.render('settings', {title: 'Settings'});
    };

    var userid = getUserID(res);
});

module.exports = router;