var express = require('express');
var router = express.Router();
var db_cmds = require('../db-functions/db_cmds');
var common_fcns = require('../common/common_router_fcns');

/* GET home page. */
router.get('/', function(req, res, next) {
    var cb = function() {
        res.render('index', {title: 'Apollo'});
    };

    // Redirect if logged in
    if (!common_fcns.loggedInRedirect(res, req)) cb();
});

router.route('/login')
    .get(function (req, res) {
        var cb = function (suggestedTrack) {
            res.render('login', {title: 'Log In'});
        };

        // Redirect if logged in
        if (!common_fcns.loggedInRedirect(res, req)) cb();
    })
    .post(function (req, res) {
        var username = req.body.username;
        var password = req.body.password;

        // Set cookie on success, then redirect to welcome
        var successCallback = function(userid) {
            common_fcns.setCookie(res, userid);
            res.redirect('/welcome');
        };

        // Handle bad credentials
        var failureCallback = function() {
            res.send("error");   // DEBUG
        };

        // Check credentials
        db_cmds.loginUser(username, password, successCallback, failureCallback);
    });

router.route('/create-user')
    .get(function (req, res) {
        var cb = function (suggestedTrack) {
            res.render('create-user', {title: 'Create User'});
        };

        // Redirect if logged in
        if (!common_fcns.loggedInRedirect(res, req)) cb();
    })
    .post(function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var firstname = req.body.prefFirstName;
        var lastname = req.body.lastName;
        // Set cookie on success, then redirect to welcome
        var successCallback = function(userid) {
            common_fcns.setCookie(res, userid);
            res.redirect('/welcome');
        };

        // Handle bad create
        var failureCallback = function(message) {
            res.render('create-user', {title: 'Create User', error: message});   // DEBUG
        };

        // Check credentials
        db_cmds.createUser(username, password, firstname, lastname, successCallback, failureCallback);
    });

router.route('/welcome').get(function(req, res){
    var callbackSuggestionSucceeded = function(trackID, trackName, artistName, musicGroup){
        var stash = function(prefFirstName, lastName){
            bothSucceeded(prefFirstName, lastName, trackID, trackName, artistName, musicGroup)
        }
        var stashFail = function(){
            userFailedSuggestionSucceeded(trackID, trackName, artistName, musicGroup)
        }
        db_cmds.getUserFullNameAndUsername(userid, stash, stashFail);
    }
    var callbackSuggestionFailed = function() {
        var str = 'No suggested song found.';
        var stashDoubleFail = function(){
            bothFailed(str);
        }
        var stashFail = function(prefFirstName, lastName, username){
            suggestionFailedUserSucceded(prefFirstName, lastName, username, str);
        }
        db_cmds.getUserFullNameAndUsername(userid, stashFail, stashDoubleFail);
    }

    var suggestionFailedUserSucceded = function(prefFirstName, lastName, username, msg){
        res.render('welcome', {title: 'Welcome', fName: prefFirstName, lName:lastName, username: username, errSuggTrack:msg});
    }

    var bothFailed = function(msg){
        res.render('welcome', {title: 'Welcome', errUser: "User not found", errSuggTrack: msg});
    }
    var userFailedSuggestionSucceeded = function(trackID, trackName, artistName, musicGroup){
        res.render('welcome', {title: 'Welcome', errUser: "User not found", trackID: trackID, trackName: trackName, artistName: artistName, musicGroup:musicGroup});
    }

    var bothSucceeded = function(prefFirstName, lastName, username, trackID, trackName, artistName, musicGroup){
        res.render('welcome', {title: 'Welcome', fName: prefFirstName, lName:lastName, username: username, trackID: trackID, trackName: trackName, artistName: artistName, musicGroup:musicGroup});
    }

    var userid = common_fcns.getUserID(req);
    db_cmds.suggestedTrack(userid, callbackSuggestionSucceeded, callbackSuggestionFailed);
});

router.route('/settings').get(function(req, res){
    /*var cb = function() {
        res.render('settings', {title: 'Settings'});
    };

    var userid = common_fcns.getUserID(res);
    if(common_fcns.loggedInRedirect(res,req)) {

    }*/
    common_fcns.GetSuggestedTrackAndUserName(res,req,'settings');
});

module.exports = router;