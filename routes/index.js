var express = require('express');
var router = express.Router();
var db_cmds = require('../db-functions/db_cmds');
var common_fcns = require('../common/common_router_fcns');


// ---- USER ROUTES ---- //

/** Root GET.
 * Description: Renders index page, and redirects to Welcome (home) page if cookie (user) is detected.
 */
router.get('/', function(req, res, next) {
    var cb = function() {
        res.render('index', {title: 'Apollo'});
    };

    // Redirect if logged in
    if (!common_fcns.loggedInRedirect(res, req)) cb();
});


/** Login routes.
 * GET: Renders login page and redirects to Welcome (home) page if cookie (user) is detected.
 * POST: Passes in username and password to database command to check login credentials.
 *  On success, redirects to Welcome (home) page, else shows error message to user.
 */
router.route('/login')
    .get(function (req, res) {
        var cb = function () {
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
            res.render('login', {title: 'Log In', errorLogin: 'Wrong username/password. Please try again.'});
        };

        // Check credentials
        db_cmds.loginUser(username, password, successCallback, failureCallback);
    });


/** Create user routes.
 * GET: Renders Create User page and redirects to Welcome (home) page if cookie (user) is detected.
 * POST: Passes in username, password, first name and last name of user to be created into database command
 * to create user. On success, redirects to Welcome (home) page, else show error message to user.
 */
router.route('/create-user')
    .get(function (req, res) {
        var cb = function () {
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
            res.render('create-user', {title: 'Create User', error: message});
        };
        if (username.replace(/\s+/g, '') == "" || password.replace(/\s+/g, '') == "" || firstname.replace(/\s+/g, '') == "" || lastname.replace(/\s+/g, '') == ""){
            failureCallback('None of these fields can be empty. Please try again.');
        } else {
            // Check credentials
            db_cmds.createUser(username, password, firstname, lastname, successCallback, failureCallback);
        }
    });


/** Welcome (home) page route.
 * GET: Gets suggested track and user name for home page.
 */
router.route('/welcome')
    .get(function(req, res){
        var cb = function () {
            res.render('/index', {title: 'Apollo'});
        };

        // Redirect if logged in
        if (!common_fcns.loggedOutRedirect(res, req)) cb();
        else common_fcns.GetSuggestedTrackAndUserName(res,req,'welcome');
    });


/** Settings page routes.
 * GET: Gets suggested track and user name for settings page.
 * POST: Calls database command to update password.
 */
router.route('/settings')
    .get(function(req, res){
        common_fcns.GetSuggestedTrackAndUserName(res,req,'settings');
    })
    .post(function(req, res){
        common_fcns.changePassword(res, req);
    });

/** Log out route.
 * POST: Calls command to log user out.
 */
router.route('/logout')
    .post(function(req, res){
        common_fcns.logOut(res, req);
    });

/** Delete account route.
 * POST: Calls database command to delete user account and redirect.
 */
router.route('/deleteAccount')
    .post(function(req, res){
        common_fcns.deleteAccount(res, req);
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


/** My tracks route.
 * GET: Call database command to get user's personal tracks.
 */
api.route('/mytracks')
    .get(function (req, res) {
        common_fcns.getUserTracks(res, req);
    });


/** Top 50 tracks route.
 * GET: Call database command to get user's top 50 should-have tracks.
 */
api.route('/top50tracks')
    .get(function (req, res) {
        common_fcns.getTop50Tracks(res, req);
    });


/** Likes:track_id route.
 * GET: Call database command to get likes on particular track id.
 */
api.route('/likes/:track_id')
    .get(function (req, res) {
        common_fcns.getTrackLikes(res, req, req.params.track_id);
    });


/** All tracks route.
 * GET: Call database command to get all user's tracks, personal and group.
 */
api.route('/alltracks')
    .get(function(req, res){
        common_fcns.getAllTracks(res, req);
    });


/** Playlists route.
 * GET: Call database command to get user's playlists, personal and group.
 */
api.route('/playlists')
    .get(function(req, res){
        common_fcns.getPlaylists(res, req);
    });


/** Playlists:playlist_id route.
 * GET: Call database command to get total elapsed time of particular playlist id.
 */
api.route('/playlists/:playlist_id')
    .get(function(req,res){
        common_fcns.getPlaylistLength(res, req, req.params.playlist_id);
    });


/** Random playlist route.
 * POST: Call database command to generate and return random playlist.
 */
api.route('/randomplaylist')
    .post(function(req, res){
        common_fcns.GenerateRandomPlaylist(res, req);
    });

// Wire up router
router.use('/api', api);

module.exports = router;