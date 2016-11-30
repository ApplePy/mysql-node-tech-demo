/**
 * Created by darryl on 2016-11-22.
 */

var db = require('../db');
var Promise = require('promise');

/** Get suggested user track.
 *
 * @param userid            The user ID from which to retrieve the suggested track.
 * @param successCallback   function(trackID, trackName, artistName, musicgroupName) to be called when command succeeds.
 * @param failureCallback   function() to be called when command fails.
 */
exports.suggestedTrack = function (userid, successCallback, failureCallback) {

    // Call failure callback on failure or no results, call successCallback with results if success.
    var cb = function(error, results) {
        if (error || results.length == 0) {
            failureCallback();
        }
        else {
            var res = results[0];
            successCallback(res.trackID, res.trackName, res.artistName, res.musicgroupName);
        }
    };

    // Get trackID, trackName, artistName, and musicgroupName for tracks the user has access to, but does not own
    db.query({
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
            "WHERE track.trackID NOT IN (" +
            "SELECT trackID " +
            "FROM usertracks " +
            "WHERE userID = ?) " +
            "AND g.musicgroupID IN (" +
            "SELECT mgm.musicgroup " +
            "FROM musicgroupmembership AS mgm " +
            "WHERE mgm.user=?)" +
            "GROUP BY track.trackID " +
            "LIMIT 1;",
            values: [userid, userid]
        },
        cb);
};

/** Login user
 *
 * @param username          The username of the logging in user.
 * @param password          The password of the logging in user.
 * @param successCallback   function(userID) to be called when command succeeds.
 * @param failureCallback   function() to be called when command fails.
 */
exports.loginUser = function(username, password, successCallback, failureCallback){

    // Call successCallback with userID if success, call failureCallback if false
    var cbmiddle = function(error, results){
        if (error) {
            failureCallback();
        }
        else if (results.length == 0) {
            failureCallback();
        }
        else {
            var userid = results[0].userID;
            successCallback(userid);
        }
    };

    // Query for user
    // TODO: Password hashing?
    db.query({
            sql: "SELECT userID " +
            "FROM user " +
            "WHERE username = ? " +
            "AND password = ?",
            values: [username, password]
        },
        cbmiddle);
};

/** Create user.
 *
 * @param username          The requested new username.
 * @param password          The requested new password.
 * @param prefFirstName     The requested first name.
 * @param lastName          The requested last name.
 * @param successCallback   function(trackID, trackName, artistName, musicgroupName) to be called when command succeeds.
 * @param failureCallback   function(error) to be called when command fails. Contains error text.
 */
exports.createUser = function(username, password, prefFirstName, lastName, successCallback, failureCallback){
    // Call loginUser to retrieve User ID on create user success, call failureCallback with a message otherwise
    var cbmiddle1 = function(error, results){
        if (error) {
            failureCallback(error);
        }
        else {
            // Apply msg, since loginuser cb doesn't take an arg
            var failure = function() {failureCallback("Undefined error.")};
            exports.loginUser(username, password, successCallback, failure);
        }
    };

    // Insert user
    // TODO: Password hashing?
    db.query({
            sql: "INSERT INTO user(username, password, prefFirstName, lastName) " +
            "VALUES(?, ?, ?, ?)",
            values: [username, password, prefFirstName, lastName]
        },
        cbmiddle1);
};

/** Get user first name.
 *
 * @param userid            The userid to retrieve first and last name for.
 * @param successCallback   function(firstName, lastName, username) to be called when command succeeds.
 * @param failureCallback   function(error) to be called when command fails. Contains error text.
 */
exports.getUserFullNameAndUsername = function(userid, successCallback, failureCallback) {
    // Call loginUser to retrieve User ID on create user success, call failureCallback with a message otherwise
    var cb = function(error, results){
        if (error) {
            failureCallback(error);
        }
        else if (results.length == 0) {
            failureCallback("User not found.");
        }
        else {
            // Apply msg, since loginuser cb doesn't take an arg
            var failure = function() {failureCallback("Undefined error.")};
            successCallback(results[0].prefFirstName, results[0].lastName, results[0].username);
        }
    };

    // Get user's full name
    db.query({
            sql: "SELECT prefFirstName, lastName, username FROM user WHERE userid = ?",
            values: [userid]
        },
        cb);
};

/** Update user with new password.
 *
 * @param userid            The userID to update.
 * @param password          The new password.
 * @param successCallback   function() to be called when command succeeds.
 * @param failureCallback   function(error) to be called when command fails. Contains error text.
 */
exports.updateUserPassword = function(userid, password, successCallback, failureCallback) {
    // Call successCallback on update success, call failureCallback with a message otherwise
    console.log(userid);
    console.log(password);
    var cb = function(error, results){
        if (error) {
            failureCallback(error);
        }
        else {
            successCallback(results);
        }
    };

    // Update user with new password
    // TODO: Password hashing?
    db.query({
            sql: "UPDATE user " +
            "SET password=? " +
            "WHERE userID = ?",
            values: [password, userid]
        },
        cb);
};

/** Get all tracks for user.
 *
 * @param userid            The userID to check.
 * @param successCallback   function(result) to be called when command succeeds. 'result' structure: [{trackid, trackName, length, artistName, albumName}, {...}]
 * @param failureCallback   function(error) to be called when command fails. Contains error text.
 */
exports.getAllUserTracks = function(userid, successCallback, failureCallback) {
    // Call the appropriate callback
    var cb = function(error, results){
        if (error) {
            failureCallback(error);
        }
        else if (results.length == 0) {
            failureCallback("User has no tracks.");
        }
        else {
            successCallback(results);
        }
    };

    // Get user's tracks
    db.query({
            sql: "SELECT track.trackID AS trackid, trackName, length AS trackLength, artistName, albumName " +
            "FROM track " +
            "JOIN usertracks ON track.trackID = usertracks.trackID " +
            "JOIN albumordering ON track.trackID = albumordering.track " +
            "JOIN album ON albumordering.album = album.albumID " +
            "JOIN artist ON album.artist=artist.artistID " +
            "WHERE usertracks.userID = ? " +
            "GROUP BY track.trackID",
            values: [userid]
        },
        cb);
};

/** Get the number of users who also have this track (likes).
 *
 * @param userid            The user doing the query.
 * @param trackid           The track being queried about.
 * @param successCallback   function(likes) to be called when command succeeds.
 * @param failureCallback   function(error) to be called when command fails. Contains error text.
 */
exports.getLikes = function(userid, trackid, successCallback, failureCallback) {
    // Call the appropriate callback
    var cb = function(error, results){
        if (error) {
            failureCallback(error);
        }
        else {
            successCallback(results[0].likes);
        }
    };

    // Get user's track's likes
    db.query({
            sql: "SELECT COUNT(userID) AS likes " +
            "FROM usertracks " +
            "WHERE usertracks.userID != ? " +
            "AND trackID = ?",
            values: [userid, trackid]
        },
        cb);
};

/** Get tracks that the user does not own, sorted by popularity.
 * @param userid            The user doing the query.
 * @param successCallback   function(results) to be called when command succeeds. 'result' structure: [{trackid, trackName, length, artistName, albumName, likes}, {...}]
 * @param failureCallback   function(error) to be called when command fails. Contains error text.
 */
exports.getPopularTracks = function(userid, successCallback, failureCallback) {
    // Call the appropriate callback
    var cb = function(error, results){
        if (error) {
            failureCallback(error);
        }
        else {
            successCallback(results);
        }
    };

    // NOTE: Inner SELECTs finds all tracks that the user has access to and all the likes for the track, and the outer one gets all the info for those tracks
    db.query({
            sql: "SELECT track.trackID AS trackid, track.trackName, track.length AS trackLength, artistName, albumName, likes " +
            "FROM " +   // Get trackIDs and likes (likes include tracks that may not be accessible)
            "( " +      // Get trackIDs that are accessible, but don't belong to the user
            "SELECT trackID " +
            "FROM usertracks " +
            "WHERE usertracks.userID != ? " +
            "AND usertracks.trackID IN ( " +
            "SELECT track.trackID " +
            "FROM track " +
            "JOIN playlistordering ON track.trackID = playlistordering.trackID " +
            "JOIN sharedplaylists ON sharedplaylists.playlist = playlistordering.playlistID " +
            "JOIN musicgroupmembership AS mgm ON mgm.musicgroup = sharedplaylists.musicgroup " +
            "WHERE mgm.user = ? " +
            ") " +
            ") AS accessibleTracks " +
            "NATURAL JOIN ( " +     // Get number of users (outside of yourself) that has each track
            "SELECT trackID, COUNT(userID) AS likes " +
            "FROM usertracks " +
            "WHERE usertracks.userID != ? " +
            "GROUP BY usertracks.trackID " +
            ") AS trackLikes " +
            "JOIN track ON accessibleTracks.trackID = track.trackID " +
            "JOIN albumordering ON accessibleTracks.trackID = albumordering.track " +
            "JOIN album ON albumordering.album = album.albumID " +
            "JOIN artist ON album.artist = artist.artistID " +
            "GROUP BY track.trackID " +
            "ORDER BY likes DESC " +
            "LIMIT 50",
            values: [userid, userid, userid]
        },
        cb);
};


/** Get all tracks that a user can access.
 *
 * @param userid            The userID to check.
 * @param successCallback   function(result) to be called when command succeeds. 'result' structure: [{trackid, trackName, length, artistName, albumName}, {...}]
 * @param failureCallback   function(error) to be called when command fails. Contains error text.
 */
exports.getAllTracksAccessible = function(userid, successCallback, failureCallback) {
    // Call the appropriate callback
    var cb = function(error, results){
        if (error) {
            failureCallback(error);
        }
        else if (results.length == 0) {
            failureCallback("User has no tracks to access.");
        }
        else {
            successCallback(results);
        }
    };

    // Get user's tracks, where inner SELECT gets all the tracks the user does not own
    db.query({
            sql: "SELECT track.trackID AS trackid, trackName, length AS trackLength, artistName, albumName " +
            "FROM track " +
            "JOIN usertracks ON track.trackID = usertracks.trackID " +
            "JOIN albumordering ON track.trackID = albumordering.track " +
            "JOIN album ON albumordering.album = album.albumID " +
            "JOIN artist ON album.artist=artist.artistID " +
            "WHERE usertracks.userID = ? " +
            "OR track.trackID IN (" +
            "SELECT trackID " +
            "FROM playlistordering AS po " +
            "JOIN sharedplaylists AS sp ON po.playlistID=sp.playlist " +
            "JOIN musicgroupmembership AS mgm ON sp.musicgroup=mgm.musicgroup " +
            "WHERE mgm.user = ?) " +
            "GROUP BY track.trackID " +
            "ORDER BY artist.artistName, album.albumName, track.trackName",
            values: [userid, userid]
        },
        cb);
};


/** Create a new random playlist.
 *
 * @param userid                The userid for who will own the new playlist.
 * @param playlistname          The name for the new playlist.
 * @param trackColumnFilter     The track column to filter new tracks by. String only.
 * @param filterValue           The value(s) to filter new tracks by. Array of values.
 * @param playlistLength        The length of the playlist to generate
 * @param successCallback       function(result) to be called when command succeeds. 'result' structure: [{trackID, trackName, length, artistName, albumName}, {...}]
 * @param failureCallback       function(error) to be called when command fails. Contains error text.
 */
exports.createNewRandomPlaylist = function(userid,
                                           playlistname,
                                           trackColumnFilter,
                                           filterValue,
                                           playlistLength,
                                           successCallback,
                                           failureCallback) {

    /** Promise factory to wrap all the DB calls and error checking
     *
     * @param func                  The db function to call.
     * @param queryObj              The query object to pass to the db (can be null)
     * @param badResultPredicate    A function(result):boolean that specifies if a result is bad(true) or good (false), can be null
     * @returns {Promise}           Returns a promise to run.
     */
    let promiseFactory = (func, queryObj, badResultPredicate)=>{
        return new Promise(function(resolve, reject) {
            // The callback to be passed to func.
            var callback = function (err, result) {
                // If the function failed, or the result fails the predicate (if one exists), reject.
                if (typeof badResultPredicate == "function")
                    if (err || badResultPredicate(result)) reject(err, result);
                    // Otherwise resolve
                    else resolve(result);
                else
                    if (err) reject(err, result);
                    // Otherwise resolve
                    else resolve(result);
            };

            // Call function
            // If there is a query object, add it
            if (queryObj != null)
                func(queryObj, callback);
            else
                func(callback);
        });
    };

    // Get a stable, non-closing connection to the DB
    // NOTE: DO NOT THROW! MySQLJS catches them and then causes issues.
    // TODO: this binding is acting very funny
    promiseFactory(db.get().getConnection.bind(db.get())).then(
        connection=>{
            // Set up error callbacks
            let transactErr     = (err, result)=>{connection.release.bind(connection)(); failureCallback(err);};
            let rollbackErr     = (err, result)=>connection.rollback.bind(connection)(()=>{transactErr(err)});
            let postCommitErr   = function(err, result) {return connection.rollback.bind(connection)(()=>connection.query.bind(connection)({
                sql: "DELETE FROM playlist WHERE playlistID = ?",
                values: [this.specialresult[0].playlistID]
            }, transactErr))};

            // Start transaction
            promiseFactory(connection.query.bind(connection), "START TRANSACTION READ WRITE", null).then(
                ()=>{
                    // Insert new playlist
                    promiseFactory(connection.query.bind(connection), {
                        sql: 'INSERT INTO playlist(playlistName, datetimeCreated, createdBy) ' +
                        'VALUES(?, NOW(), ?)',
                        values: [playlistname, userid]
                    }).then(
                        ()=>{
                            // Get the information for the newly created playlist
                            promiseFactory(connection.query.bind(connection), {
                                sql: "SELECT playlistID, playlistName, datetimeCreated, username " +
                                "FROM playlist " +
                                "JOIN user ON createdBy=user.userID " +
                                "WHERE playlistName = ? AND createdBy = ? " +
                                "ORDER BY datetimeCreated DESC " +
                                "LIMIT 1",
                                values: [playlistname, userid]
                            }, result=> result.length == 0).then (
                                specialresult=> {
                                    // Set up the countinbg variable
                                    promiseFactory(connection.query.bind(connection), "SET @position := 0", null)
                                        .then(
                                        ()=> {
                                            // Insert random tracks that the user owns
                                            promiseFactory(connection.query.bind(connection), {
                                                sql: "INSERT INTO " +
                                                "playlistordering(playlistID, trackID, position) " +
                                                "SELECT ?, trackID, (@position := ifnull(@position, 0) + 1)" +
                                                "FROM (SELECT trackID " +
                                                "FROM track " +
                                                "NATURAL JOIN usertracks " +
                                                "WHERE ? LIKE ? " +
                                                "AND usertracks.userID = ?" +
                                                "LIMIT 20) AS tid",
                                                values: [specialresult[0].playlistID, "track." + trackColumnFilter, filterValue, userid/*, playlistLength*/]
                                            }).then(
                                                ()=>{
                                                    promiseFactory(connection.commit.bind(connection))       // COMMIT LINE HERE
                                                        .then(
                                                        ()=>{
                                                            // Get all the tracks that were just randonly added
                                                            promiseFactory(connection.query.bind(connection), {
                                                                sql: "SELECT track.trackID AS trackid, trackName, length AS trackLength, artistName, albumName " +
                                                                "FROM track " +
                                                                "JOIN artist ON track.artist = artist.artistID " +
                                                                "JOIN albumordering ON track.trackID = albumordering.track " +
                                                                "JOIN album ON albumordering.album = album.albumID " +
                                                                "JOIN playlistordering ON track.trackID = playlistordering.trackID " +
                                                                "WHERE playlistID = ? " +
                                                                "GROUP BY playlistordering.position " +
                                                                "ORDER BY playlistordering.position",
                                                                values: [specialresult[0].playlistID]
                                                            }, result=>result.length == 0).then(
                                                                finalResult=>{
                                                                    // Construct final data for front end.
                                                                    let refinedFinalData = {
                                                                        metadata: specialresult[0],
                                                                        contents: finalResult
                                                                    };

                                                                    // Clean up and send
                                                                    connection.release.bind(connection)();
                                                                    successCallback(refinedFinalData);
                                                                }, (err, result)=>postCommitErr.bind(this)({customerr: true, reason: "Playlist contents not retrieved."}, result));
                                                        }, postCommitErr.bind(this));
                                                }, rollbackErr);
                                        }, rollbackErr);
                                }, (err, result)=>rollbackErr({customerr: true, reason: "Playlist was not created."}, result));
                        }, rollbackErr);
                }, transactErr);
        }, err=>failureCallback(err));
};

/** Get play time length of playlist.
 *
 * @param playlistID        The playlist to count.
 * @param successCallback   function(playtime) to be called when command succeeds. In milliseconds.
 * @param failureCallback   function(error) to be called when command fails. Contains error text.
 */
exports.getPlaylistLength = function(playlistID, successCallback, failureCallback) {
    // Call the appropriate callback
    var cb = function(error, results){
        if (error) {
            failureCallback(error);
        }
        else if (results.length == 0) {
            failureCallback("Playlist has no tracks.");
        }
        else {
            successCallback(results[0].playtime);
        }
    };

    // Get user's tracks
    db.query({
            sql: "SELECT SUM(length) AS playtime " +
            "FROM playlistordering AS po " +
            "JOIN track ON track.trackID=po.trackID " +
            "WHERE po.playlistID = ?",
            values: [playlistID]
        },
        cb);
};


/** Gets all playlists accessible to a user.
 *
 * @param userid            The user to request accessible playlist for
 * @param successCallback   function(results) to be called when command succeeds. 'results' format: [{playlistid, playlistName, datetimeCreated, username}, ...]
 * @param failureCallback   function(error) to be called when command fails. Contains error text.
 */
exports.getAllPlaylistsAccessible = function(userid, successCallback, failureCallback){
    var cb = function(error, results){
        if (error) {
            failureCallback(error);
        }
        else if (results.length == 0) {
            failureCallback("User has no playlists to access.");
        }
        else {
            successCallback(results);
        }
    };

    //Get playlists, including ones not shared by the requesting user
    db.query({
            sql: "SELECT playlist.playlistID AS playlistid, playlistName, datetimeCreated, user.username AS username " +
            "FROM playlist " +
            "LEFT JOIN sharedplaylists ON playlist.playlistID = sharedplaylists.playlist " +
            "LEFT JOIN musicgroupmembership ON sharedplaylists.musicgroup = musicgroupmembership.musicgroup " +
            "LEFT JOIN user ON playlist.createdBy = user.userID " +
            "WHERE musicgroupmembership.user = ? " +
            "OR playlist.createdBy = ? " +
            "GROUP BY playlistID " +
            "ORDER BY datetimeCreated DESC",
            values: [userid, userid]
        },
        cb);
};


/** Deletes a user.
 *
 * @param userid            The user to delete.
 * @param successCallback   function() that is called when the task succeeds.
 * @param failureCallback   function(msg) that is called when the task fails.
 */
exports.deleteUser = function(userid, successCallback, failureCallback) {
    var cb = function(error){
        if (error) failureCallback(error);
        else successCallback();
    };

    // Delete user
    db.query({
            sql: "DELETE FROM users WHERE userid = ?",
            values: [userid,]
        },
        cb);
};
