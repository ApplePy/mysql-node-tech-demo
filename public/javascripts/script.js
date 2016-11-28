/**
 * Created by danazagar on 2016-11-23.
 */
$(document).ready(function(){
    $("#mytracks").on("click", getTracks);
    $("#top50tracks").on("click", getTop50Tracks);
    $("#alltracks").on("click", getAllTracksAccessible);
    $("#playlists").on("click", getPlaylists);
});

function getAllTracksAccessible(){
    $('.trackListing').empty();
    $.getJSON('/api/alltracks', function(data){
        var toJade = "";
        $.each(data, function(){
            var minutes = Math.floor(this.trackLength/60000);
            var seconds = Math.floor((this.trackLength % 60000)/1000);
            var secondsFormatted = (seconds < 10 ? '0' : '') + seconds;
            toJade += '<div class = "row">';
            toJade += '<p>' + this.trackName + '  |  ' + minutes + ':' + secondsFormatted + '  |  ' + this.artistName + '  |  ' + this.albumName;
            toJade += '  |  <button onclick = "getLikes(' + this.trackid + ')"> Get Current Likes </button>'
            toJade += '<div class = "likes' + this.trackid + '"></div></p>';
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
            toJade += '<div class = "row">';
            toJade += '<p>' + this.trackName + '  |  ' + minutes + ':' + secondsFormatted + '  |  ' + this.artistName + '  |  ' + this.albumName;
            toJade += '  |  <button onclick = "getLikes(' + this.trackid + ')"> Get Current Likes </button>'
            toJade += '<p class = "likes' + this.trackid + '"></p></p>';
            toJade += '</div>';
        });
        $('.trackListing').append(toJade);
    });
}

function getTop50Tracks(){
    $('.trackListing').empty();
    $.getJSON('/api/top50tracks', function(data){
        console.log(data);
        var toJade = "";
        $.each(data, function(){
            var minutes = Math.floor(this.trackLength/60000);
            var seconds = Math.floor((this.trackLength % 60000)/1000);
            var secondsFormatted = (seconds < 10 ? '0' : '') + seconds;
            toJade += '<div class = "row">';
            toJade += '<p>' + this.trackName + '  |  ' + minutes + ':' + secondsFormatted + '  |  ' + this.artistName + '  |  ' + this.albumName + '  |  ' + this.likes + '</p>';
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
        console.log(data);
        var toJade = "";
        $.each(data, function(){
            toJade += '<div class = "row">';
            toJade += '<p>' + this.playlistid + '  |  ' + this.playlistName + '  |  ' + this.datetimeCreated + '  |  ' + this.username + '</p>';
            toJade += '  |  <button onclick = "getPlaylistLength(' + this.playlistid + ')"> Get Current Likes </button>'
            toJade += '<p class = "length' + this.playlistid + '"></p></p>';
            toJade += '</div>';
        });
        $('.playlistwell').append(toJade);
    })
}

function getPlaylistLength(playlistid){
    $('.length' + playlistid).empty();
    $.getJSON(('/api/playlists/' + playlistid), function(data){
        $('.length' + playlistid).append(data);
    });
}
