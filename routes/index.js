var express = require('express');
var router = express.Router();
var db_cmds = require('db_cmds');

/* GET home page. */
router.get('/', function(req, res, next) {
    var cb = function(suggestedTrack) {
        res.render('index', {title: 'Apollo'});
    };
});

router.route('/login').get(function(req, res){
    var cb = function(suggestedTrack) {
        res.render('login', {title: 'Log In'});
    };
});

router.route('/create-user').get(function(req, res){
    var cb = function(suggestedTrack) {
        res.render('create-user', {title: 'Create User'});
    };
});

router.route('/welcome').get(function(req, res){
    var cb = function(suggestedTrack) {
        res.render('welcome', {title: 'Welcome', suggestedTrack: suggestedTrack})
    };

    var userid = *something*;

    db_cmds.suggestedtrack(userid, cb);
});

router.route('/settings').get(function(req, res){
    var cb = function(suggestedTrack) {
        res.render('settings', {title: 'Settings'});
    };
});

module.exports = router;