/**
 * Created by danazagar on 2016-11-23.
 */
var db_cmds = require('../db-functions/db_cmds');
var common_fcns = require('../common/common_router_fcns')

// Sets the user ID cookie
// TODO: Set the cookie as signed
exports.setCookie = function(res, userid) {
    res.cookie("userid", userid, {overwrite: true, maxAge: 1000 * 60 * 60 * 24}); // 24 hour expiry
};

// Get user ID from cookie
// TODO: Decrypt cookie once signed
exports.getUserID = function(req) {
    if (req.cookies != undefined) {
        if (req.cookies.userid != undefined)
            return req.cookies.userid;
    }
    else return undefined;
};

// Redirect if logged in
// TODO: Verify that the user ID actually exists
exports.loggedInRedirect = function(res, req) {
    var userid = common_fcns.getUserID(req);
    if (userid != undefined) {
        res.redirect('/welcome');
        return true;
    }
    else {
        return false;
    }
};

exports.logOut = function(res, req){
    res.cookie("userid", "", { expires: new Date() });
    res.json({ 'redirect' : '/'});
}

exports.deleteAccount = function(res, req){
    var successCallback = function(results){
        console.log('success');
        res.cookie("userid", "", { expires: new Date() });
        res.json({ 'redirect' : '/'});
    }
    var failureCallback = function(msg){
        console.log(msg);
        res.send(msg);
    }
    var userid = common_fcns.getUserID(req);
    try {
        db_cmds.deleteUser(userid, successCallback, failureCallback);
    } catch (e) {
        failureCallback(e);
    }
}

exports.GetSuggestedTrackAndUserName = function(res, req, pageName){
    var callbackSuggestionSucceeded = function(trackID, trackName, artistName, musicGroup){
        var stash = function(prefFirstName, lastName, username){
            bothSucceeded(prefFirstName, lastName, username, trackID, trackName, artistName, musicGroup)
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
            suggestionFailedUserSucceeded(prefFirstName, lastName, username, str);
        }
        db_cmds.getUserFullNameAndUsername(userid, stashFail, stashDoubleFail);
    }

    var suggestionFailedUserSucceeded = function(prefFirstName, lastName, username, msg){
        res.render(pageName, {title: 'Welcome', fName: prefFirstName, lName:lastName, username: username, errSuggTrack:msg});
    }

    var bothFailed = function(msg){
        res.render(pageName, {title: 'Welcome', errUser: "User not found", errSuggTrack: msg});
    }
    var userFailedSuggestionSucceeded = function(trackID, trackName, artistName, musicGroup){
        res.render(pageName, {title: 'Welcome', errUser: "User not found", trackID: trackID, trackName: trackName, artistName: artistName, musicGroup:musicGroup});
    }

    var bothSucceeded = function(prefFirstName, lastName, username, trackID, trackName, artistName, musicGroup){
        //Weird extra decimal number on the end of group name (when generated into db), taking that off
        var group = musicGroup.split('0.');
        res.render(pageName, {title: 'Welcome', fName: prefFirstName, lName:lastName, username: username, trackID: trackID, trackName: trackName, artistName: artistName, musicGroup:group[0]});
    }

    var userid = common_fcns.getUserID(req);
    db_cmds.suggestedTrack(userid, callbackSuggestionSucceeded, callbackSuggestionFailed);
}

exports.getUserTracks = function(res, req){
    var successCallback = function(results){
        res.send(JSON.stringify(results));
        //res.render('welcome', {title: 'Welcome', tracks: results});
    }
    var failureCallback = function(msg){
        res.send(msg);
    }
    var userid = common_fcns.getUserID(req);
    db_cmds.getAllUserTracks(userid, successCallback, failureCallback);
}

exports.getTop50Tracks = function(res, req){
    var successCallback = function(results){
        res.send(JSON.stringify(results));
    }
    var failureCallback = function(msg){
        res.send(msg);
    }
    var userid = common_fcns.getUserID(req);
    db_cmds.getPopularTracks(userid, successCallback, failureCallback);
}

exports.getTrackLikes = function(res, req, trackid){
    var successCallback = function(results){
        console.log(results);
        res.send(JSON.stringify(results));
    }
    var failureCallback = function(msg){
        res.send(msg);
    }
    var userid = common_fcns.getUserID(req);
    db_cmds.getLikes(userid, trackid, successCallback, failureCallback);
}

exports.getAllTracks = function(res, req){
    var successCallback = function(results){
        res.send(JSON.stringify(results));
    }
    var failureCallback = function(msg){
        res.send(msg);
    }
    var userid = common_fcns.getUserID(req);
    db_cmds.getAllTracksAccessible(userid, successCallback, failureCallback);
}

exports.getPlaylists = function(res, req){
    var successCallback = function(results){
        res.send(JSON.stringify(results));
    }
    var failureCallback = function(msg){
        res.send(msg);
    }
    var userid = common_fcns.getUserID(req);
    db_cmds.getAllPlaylistsAccessible(userid, successCallback, failureCallback);
}

exports.getPlaylistLength = function(res, req, playlistid){
    var successCallback = function(results){
        res.send(JSON.stringify(results));
    }
    var failureCallback = function(msg){
        res.send(msg);
    }
    db_cmds.getPlaylistLength(playlistid, successCallback, failureCallback);
}

exports.changePassword = function(res, req){
    var successCallback = function(){
        res.json({message: 'Success'});
    }
    var failureCallback = function(msg){
        res.send(msg);
    }
    var userid = common_fcns.getUserID(req);
    var password = req.body.password;
    db_cmds.updateUserPassword(userid, password, successCallback, failureCallback);
}

exports.GenerateRandomPlaylist = function(res, req){
    var successCallback = function(results){
        res.send(JSON.stringify(results));
    }
    var failureCallback = function(msg){
        res.send(msg);
    }
    var userid = common_fcns.getUserID(req);
    try {
        db_cmds.createNewRandomPlaylist(userid, req.body.name, req.body.column, req.body.filter, req.body.length, successCallback, failureCallback);
    } catch (e) {
        failureCallback(e);
    }
}

