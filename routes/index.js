var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Apollo' });
});

router.route('/login').get(function(req, res){
    res.render('login', {title: 'Log In'});
});

router.route('/create-user').get(function(req, res){
    res.render('create-user', {title: 'Create User'});
});

router.route('/login').get(function(req, res){
    res.render('welcome', {title: 'Welcome'});
});

router.get('/settings', function(req, res){
    res.render('settings', {title: 'Settings'});
});

module.exports = router;