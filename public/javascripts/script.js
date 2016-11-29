/**
 * Created by danazagar on 2016-11-23.
 */
$(document).ready(function(){
    $("#mytracks").on("click", getTracks);
    $("#top50tracks").on("click", getTop50Tracks);
    $("#alltracks").on("click", getAllTracksAccessible);
    $("#playlists").on("click", getPlaylists);
    $("#randomplaylist").on("click", genRandPlaylist);
});

/*function generateRandPlaylist() {
    $('.trackListing').empty();
    $('.playlistwell').empty();

    $.getJSON('/api/randomplaylist', function (data) {
        data.slice(1);
        var toJadeTracks = "";
        var toJadePlaylistWell = "";
        var date = data[0].datetimeCreated.split('T');
        toJadePlaylistWell += '<div class = "row trackrow">';
        toJadePlaylistWell += '<p>' + data[0].playlistName + '  |  ' + date[0] + '  |  ' + data[0].username;
        toJadePlaylistWell += '  |  <button onclick = "getPlaylistLength(' + data[0].playlistid + ')"> Get Current Length </button>';
        toJadePlaylistWell += '<p class = "length' + data[0].playlistid + '"></p></p>';
        toJadePlaylistWell += '</div>';
        $.each(data[1], function () {
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
        $('.playlistwell').append(toJadePlaylistWell);
    })
}*/

///// REDO GENERATE FUNCTION
function genRandPlaylist(){
    var newName = prompt('Please enter a playlist name: ', 'Type your new playlist name here.');
    var columnFilter = 'trackName';
    var filterVal = prompt('Please enter which value you would like to filter your tracks on (or leave blank if not): ', 'Type your value here.');
    var numTracks = prompt('Please enter the number of tracks you would like to have in your playlist: ', 'Type number here.');
    if (newName == "") return alert('Name cannot be blank. Please try again.');
    if (numTracks == 0 || numTracks == "") return alert('Please insert a value to determine the number of tracks.');
    if (filterVal != "") filterVal = '%' + filterVal + '%';
    else filterVal = '%';

    $.ajax({
        type:'POST',
        data: { name: newName, column: columnFilter, filter: filterVal, length: numTracks },
        url: '/api/randomplaylist',
        dataType: 'JSON'
    }).done(function(data){
        var toJadeTracks = "";
        var toJadePlaylistWell = "";
        var date = data[0].datetimeCreated.split('T');
        toJadePlaylistWell += '<div class = "row trackrow">';
        toJadePlaylistWell += '<p>' + data[0].playlistName + '  |  ' + date[0] + '  |  ' + data[0].username;
        toJadePlaylistWell += '  |  <button onclick = "getPlaylistLength(' + data[0].playlistid + ')"> Get Current Length </button>';
        toJadePlaylistWell += '<p class = "length' + data[0].playlistid + '"></p></p>';
        toJadePlaylistWell += '</div>';
        $.each(data[1], function () {
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
        $('.playlistwell').append(toJadePlaylistWell);
    });
}

function getAllTracksAccessible(){
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
    })
}

function getTracks(){
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

function getTop50Tracks(){
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

function getLikes(trackid){
    $('.likes' + trackid).empty();
    $.getJSON(('/api/likes/' + trackid), function(data){
        $('.likes' + trackid).append(data);
    });
}

function getPlaylists(){
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
    })
}

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
