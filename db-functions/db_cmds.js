/**
 * Created by darryl on 2016-11-22.
 */

var mysql = require('mysql');

exports.suggestedtrack = function(userid, cb){
    db.query( {
        sql: "SELECT track.trackID, trackName, artistName, musicgroupName " +
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
        async: false
    }, cb);
};