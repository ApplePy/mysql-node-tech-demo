/**
 * Created by danazagar on 2016-11-23.
 */
/** On document ready.
 * Description: Runs on document ready. Assigning functions to div elements.
 */
$(document).ready(function(){
    $("#mytracks").on("click", getTracks);
    $("#top50tracks").on("click", getTop50Tracks);
    $("#alltracks").on("click", getAllTracksAccessible);
    $("#playlists").on("click", getPlaylists);
    $("#randomplaylist").on("click", genRandPlaylist);
    $('#logout').on("click", logOut);
});


/** Get user's personal track library.
 * Description: executes GET request to retrieve user tracks from database, formats each track into HTML row and appends to
 * appropriate HTML div.
 */
function getTracks(){
    $('.titleArea').empty();
    $('.trackListing').empty();

    $.getJSON('/api/mytracks', function(data){
        var toJade = "";

        $.each(data, function(){
            var minutes = Math.floor(this.trackLength/60000);
            var seconds = Math.floor((this.trackLength % 60000)/1000);
            var secondsFormatted = (seconds < 10 ? '0' : '') + seconds;

            toJade += '<div class = "row trackrow">';
            toJade += '<div class = "col-md-3">' + this.trackName + '</div><div class = "col-md-1">' + minutes + ':' + secondsFormatted + '</div><div class = "col-md-2">' + this.artistName + '</div><div class = "col-md-3">' + this.albumName + '</div>';
            toJade += '<div class = "col-md-2"><button onclick = "getLikes(' + this.trackid + ')"> Get Current Likes </button></div>'
            toJade += '<div class = "col-md-1 likes' + this.trackid + '"></div></p>';
            toJade += '</div>';
        });

        $('.trackListing').append(toJade);
    });
}


/** Get top 50 tracks the user does not currently have in their personal library, but has access to through group memberships.
 * Description: executes GET request to retrieve top 50 tracks from database, formats each track into HTML row and appends to
 * appropriate HTML div.
 */
function getTop50Tracks(){
    $('.titleArea').empty();
    $('.trackListing').empty();

    $.getJSON('/api/top50tracks', function(data){
        var toJade = "";

        $.each(data, function(){
            var minutes = Math.floor(this.trackLength/60000);
            var seconds = Math.floor((this.trackLength % 60000)/1000);
            var secondsFormatted = (seconds < 10 ? '0' : '') + seconds;

            toJade += '<div class = "row trackrow">';
            toJade += '<div class = "col-md-3">' + this.trackName + '</div><div class = "col-md-1">' + minutes + ':' + secondsFormatted + '</div><div class = "col-md-3">' + this.artistName + '</div><div class = "col-md-3">' + this.albumName + '</div>';
            toJade += '<div class = "col-md-2"> Likes: ' + this.likes + '</div></p>';
            toJade += '</div>';
        });

        $('.trackListing').append(toJade);

    });
}


/** Get all tracks the current user has access to (personal library and group tracks).
 * Description: executes GET request to retrieve all tracks user is associated with from database,
 * formats each track into HTML row and appends to appropriate HTML div.
 */
function getAllTracksAccessible(){
    $('.titleArea').empty();
    $('.trackListing').empty();

    $.getJSON('/api/alltracks', function(data){
        var toJade = "";

        $.each(data, function(){
            var minutes = Math.floor(this.trackLength/60000);
            var seconds = Math.floor((this.trackLength % 60000)/1000);
            var secondsFormatted = (seconds < 10 ? '0' : '') + seconds;

            toJade += '<div class = "row trackrow">';
            toJade += '<div class = "col-md-3">' + this.trackName + '</div><div class = "col-md-1">' + minutes + ':' + secondsFormatted + '</div><div class = "col-md-2">' + this.artistName + '</div><div class = "col-md-3">' + this.albumName + '</div>';
            toJade += '<div class = "col-md-2"><button onclick = "getLikes(' + this.trackid + ')"> Get Current Likes </button></div>'
            toJade += '<div class = "col-md-1 likes' + this.trackid + '"></div></p>';
            toJade += '</div>';
        });

        $('.trackListing').append(toJade);
    });
}


/** Get user and group membership playlists.
 * Description: executes GET request to retrieve all playlists user is associated with from database,
 * formats each track into HTML row and appends to appropriate HTML div.
 */
function getPlaylists(){
    $('.titleArea').empty();
    $('.playlistwell').empty();

    $.getJSON(('/api/playlists'), function(data){
        var toJade = "";

        $.each(data, function(){
            var date = this.datetimeCreated.split('T');

            toJade += '<div class = "row trackrow">';
            toJade += '<p>' + this.playlistName + '  |  ' + date[0] + '  |  ' + this.username;
            toJade += '  |  <button onclick = "getPlaylistLength(' + this.playlistid + ')"> Get Current Length </button>'
            toJade += '<p class = "length' + this.playlistid + '"></p></p>';
            toJade += '</div>';
        });

        $('.playlistwell').append(toJade);
    });
}


/** Generate random playlist and display playlist contents and metadata.
 * Description: Browser prompts user for several values to create the playlist. Executes POST request to insert playlist,
 * request returns playlist metadata and all track metadata. Metadata is formatted into HTML rows and appended to the
 * appropriate HTML div. Refreshes playlist well to reflect new playlist addition.
 */
function genRandPlaylist(){
    $('.titleArea').empty();
    var newName = prompt('Please enter a playlist name: ', 'Type your new playlist name here.');
    if (newName == "") return alert('Name cannot be blank. Please try again.');

    var columnFilter = 'trackName'; //Made this a variable for future iterations.

    var filterVal = prompt('Please enter which value you would like to filter your tracks on (or leave blank if not): ', 'Type your value here.');
    if (filterVal != "") filterVal = '%' + filterVal + '%';
    else filterVal = '%';

    var numTracks = prompt('Please enter the max number of tracks you would like to have in your playlist: ', 'Type number here.');
    if (numTracks == 0 || numTracks == "") return alert('Please insert a value to determine the number of tracks.');

    $('.trackListing').empty();

    $.ajax({
        type:'POST',
        data: { name: newName, column: columnFilter, filter: filterVal, length: numTracks },
        url: '/api/randomplaylist',
        dataType: 'JSON'
    }).done(function(data){
        var playlistObj = data.metadata;
        data = data.contents;
        var toJadeTracks = "";
        var toJadeListingHeader = "";
        var date = playlistObj.datetimeCreated.split('T');
        
        toJadeListingHeader += '<p>Playlist: ' + playlistObj.playlistName + '  |  Date Created: ' + date[0] + '  |  Created By: ' + playlistObj.username;
        
        $.each(data, function () {
            var minutes = Math.floor(this.trackLength / 60000);
            var seconds = Math.floor((this.trackLength % 60000) / 1000);
            var secondsFormatted = (seconds < 10 ? '0' : '') + seconds;

            toJadeTracks += '<div class = "row trackrow">';
            toJadeTracks += '<div class = "col-md-3">' + this.trackName + '</div><div class = "col-md-1">' + minutes + ':' + secondsFormatted + '</div><div class = "col-md-2">' + this.artistName + '</div><div class = "col-md-3">' + this.albumName + '</div>';
            toJadeTracks += '<div class = "col-md-2"><button onclick = "getLikes(' + this.trackid + ')"> Get Current Likes </button></div>'
            toJadeTracks += '<div class = "col-md-1 likes' + this.trackid + '"></div></p>';
            toJadeTracks += '</div>';
        });

        $('.trackListing').append(toJadeTracks);
        $('.titleArea').append(toJadeListingHeader);
        getPlaylists();
    });
}


/** Get 'likes' (a.k.a. number of associated users) on selected track.
 * Description: executes GET request to receive number of 'likes' and appends this to appropriate track row.
 * @param trackid   The track ID from which to retrieve the number of 'likes'.
 */
function getLikes(trackid){

    $('.likes' + trackid).empty();

    $.getJSON(('/api/likes/' + trackid), function(data){
        $('.likes' + trackid).append(data);
    });
}


/** Get playlist length (a.k.a. total elapsed time of tracks on playlist).
 * Description: executes GET request to receive total length (in time) of playlist and appends this to appropriate playlist row.
 * @param playlistid    The playlist ID from which to retrieve the total length (time).
 */
function getPlaylistLength(playlistid){

    $('.length' + playlistid).empty();

    $.getJSON(('/api/playlists/' + playlistid), function(data){
        var minutes = Math.floor(data/60000);
        var seconds = Math.floor((data % 60000)/1000);
        var secondsFormatted = (seconds < 10 ? '0' : '') + seconds;

        var html = minutes + ":" + secondsFormatted;

        $('.length' + playlistid).append(html);
    });
}


/** User log out.
 * Description: executes POST request to log out user (delete cookie) and redirect to index page.
 */
function logOut(){
    $.ajax({
        type:'POST',
        data: {},
        url: '/logout',
        dataType: 'JSON',
        success: function(data) {
            if (data.redirect) {
                // data.redirect contains the string URL to redirect to
                window.location.replace(data.redirect);
            }
        }
    });
}


/** Deletes the user's account.
 * Description: executes POST request that deletes the current user account that is logged in.
 * Redirects to the index page.
 */

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account?')) {
        $.ajax({
            type: 'POST',
            data: {},
            url: '/deleteAccount',
            dataType: 'JSON',
            success: function (data) {
                if (data.redirect) {
                    window.location.replace(data.redirect);
                }
            }
        })
    }
}


/** Update user password.
 * Description: executes POST request that updates the current user password that is logged in.
 */
function updatePass(){

    var pass = $("#password").val();

    $.ajax({
        type: 'POST',
        data: { 'password': pass },
        url: '/settings',
        dataType:'JSON'
    }).done(function(res){
        if (res.message != 'Success'){
            alert('Error: ' + JSON.stringify(res));
        } else {
            alert('Your password was updated successfully.');
        }
    });
}
