/**
 * Created by darryl on 2016-11-22.
 */

var db = require('../db');

exports.suggestedTrack = function (userid, cb) {
    db.query(
        "SELECT track.trackID, trackName, artistName, musicgroupName " +
        "FROM musicgroupmembership AS gm " +
        "JOIN musicgroup AS g " +
        "ON gm.musicgroup = g.musicgroupID " +
        "JOIN sharedplaylists AS sp " +
        "ON g.musicgroupID = sp.musicgroup " +
        "JOIN playlist AS p " +
        "ON sp.playlist = p.playlistID " +
        "JOIN playlistordering AS po " +
        "ON p.playlistID = po.playlistID " +
        "JOIN track " +
        "ON po.trackID = track.trackID " +
        "JOIN artist " +
        "ON track.artist = artist.artistID " +
        "WHERE gm.user != ? " +
        "ORDER BY RAND() " +
        "LIMIT 1;",
        [userid],
        cb);
};

exports.loginUser = function(username, password, successCallback, failureCallback){
    var cbmiddle = function(whatGoesHereLOL){           // TODO: figure this out
        if (InsertWorked) {                             // TODO: figure this out
            var userid = "Where does this come from?";  // TODO: figure this out
            successCallback(userid);
        }
        else
            failureCallback();
    };

    db.query(
        "SELECT userID " +
        "FROM user " +
        "WHERE username = ? " +
        "AND password = ?",
        [username, password],
        cbmiddle);
};

exports.createUser = function(username, password, prefFirstName, lastName, successCallback, failureCallback){
    var cbmiddle1 = function(error){  // TODO: figure this out
        if (error) {                     // TODO: figure this out
            var failure = function() {failureCallback("Undefined error.")};     // Application of arguments
            exports.loginUser(username, password, successCallback, failure);
        }
        else {
            failureCallback(message);           // TODO: figure this out
        }
    };

    db.query(
      "INSERT INTO tracks(username, password, prefFirstName, lastName) " +
      "VALUES(?, ?, ?, ?)",
      [username, password, prefFirstName, lastName],
      cbmiddle1);
};