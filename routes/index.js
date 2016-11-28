var express = require('express');
var router = express.Router();
var db_cmds = require('../db-functions/db_cmds');
var common_fcns = require('../common/common_router_fcns');


// ---- USER ROUTES ---- //

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

router.route('/welcome')
    .get(function(req, res){
    common_fcns.GetSuggestedTrackAndUserName(res,req,'welcome');

});

router.route('/settings')
    .get(function(req, res){
        common_fcns.GetSuggestedTrackAndUserName(res,req,'settings');
    });




// ---- API ---- //

var api = express.Router({mergeparams: true});
// Set up no-caching middleware
api.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

api.route('/mytracks')
    .get(function (req, res) {
        common_fcns.getUserTracks(res, req);
    });

api.route('/top50tracks')
    .get(function (req, res) {
        common_fcns.getTop50Tracks(res, req);
    });

api.route('/likes/:track_id')
    .get(function (req, res) {
        common_fcns.getTrackLikes(res, req, req.params.track_id);
    });

api.route('/alltracks')
    .get(function(req, res){
        common_fcns.getAllTracks(res, req);
    })

// Wire up router
router.use('/api', api);

module.exports = router;