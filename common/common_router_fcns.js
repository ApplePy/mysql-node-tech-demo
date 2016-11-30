/**
 * Created by danazagar on 2016-11-23.
 */
var db_cmds = require('../db-functions/db_cmds');
var common_fcns = require('../common/common_router_fcns')


/**
 * Set user cookie.
 * @param res       Response
 * @param userid    The user ID from which to set the cookie with.
 */
exports.setCookie = function(res, userid) {
    res.cookie("userid", userid, {overwrite: true, maxAge: 1000 * 60 * 60 * 24}); // 24 hour expiry
};

/**
 * Get user ID from cookie.
 * @param req       Request
 * @returns {*}
 */
exports.getUserID = function(req) {
    if (req.cookies != undefined) {
        if (req.cookies.userid != undefined)
            return req.cookies.userid;
    }
    else return undefined;
};


/**
 * Redirect to home page if already logged in (cookie detected).
 * @param res       Response
 * @param req       Request
 * @returns {boolean}
 */
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


/**
 * Log out (delete cookie and redirect).
 * @param res       Response
 * @param req       Request
 */
exports.logOut = function(res, req){
    res.cookie("userid", "", { expires: new Date() });
    res.json({ 'redirect' : '/'});
}


/**
 * Delete current user account (then delete cookie, redirect).
 * @param res
 * @param req
 */
exports.deleteAccount = function(res, req){
    var successCallback = function(){
        res.cookie("userid", "", { expires: new Date() });
        res.json({ 'redirect' : '/'});
    }
    var failureCallback = function(msg){
        res.send(msg);
    }
    var userid = common_fcns.getUserID(req);
    try {
        db_cmds.deleteUser(userid, successCallback, failureCallback);
    } catch (e) {
        failureCallback(e);
    }
}

/**
 * Get suggested track and current user name.
 * @param res           Response
 * @param req           Request
 * @param pageName      Page name on which to render. (settings or welcome)
 * @constructor
 */
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


/**
 * Get personal user tracks.
 * @param res       Response
 * @param req       Request
 */
exports.getUserTracks = function(res, req){
    var successCallback = function(results){
        res.send(JSON.stringify(results));
    }
    var failureCallback = function(msg){
        res.send(msg);
    }
    var userid = common_fcns.getUserID(req);
    db_cmds.getAllUserTracks(userid, successCallback, failureCallback);
}


/**
 * Get top 50 tracks the user has access to but doesn't personally have.
 * @param res     Response
 * @param req       Request
 */
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


/**
 * Get number of 'likes' on track (number of users who have that track in their personal library).
 * @param res       Response
 * @param req       Request
 * @param trackid   Track ID on which the likes are being calculated.
 */
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


/**
 * Get all tracks (personal and group).
 * @param res       Response
 * @param req       Request
 */
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


/**
 * Get all playlists (personal and group).
 * @param res       Response
 * @param req       Request
 */
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


/**
 * Get playlist length (total elapsed time of playlist by adding up track lengths).
 * @param res           Response
 * @param req           Request
 * @param playlistid    Playlist ID on which the total elapsed time is being calculated.
 */
exports.getPlaylistLength = function(res, req, playlistid){
    var successCallback = function(results){
        res.send(JSON.stringify(results));
    }
    var failureCallback = function(msg){
        res.send(msg);
    }
    db_cmds.getPlaylistLength(playlistid, successCallback, failureCallback);
}


/**
 * Change current user password.
 * @param res       Response
 * @param req       Request (contains password, not secure)
 */
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


/**
 * Generate random playlist.
 * @param res       Response
 * @param req       Request (contains all prompted values)
 * @constructor
 */
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

