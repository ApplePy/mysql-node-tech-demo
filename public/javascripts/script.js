/**
 * Created by danazagar on 2016-11-23.
 */
$(document).ready(function(){
    $("#mytracks").on("click", getTracks);
    $("#top50tracks").on("click", getTop50Tracks);
    $("#alltracks").on("click", getAllTracksAccessible);
    $("#playlists").on("click", getPlaylists);
    $("#randomplaylist").on("click", generateRandPlaylist);
});

function generateRandPlaylist() {
    $('.trackListing').empty();
    $.getJSON('/api/randomplaylist', function (data) {
        var toJade = "";
        $.each(data, function () {
            var minutes = Math.floor(this.trackLength / 60000);
            var seconds = Math.floor((this.trackLength % 60000) / 1000);
            var secondsFormatted = (seconds < 10 ? '0' : '') + seconds;
            toJade += '<div class = "row trackrow">';
            toJade += '<div class = "col-md-3">' + this.trackName + '</div><div class = "col-md-1">' + minutes + ':' + secondsFormatted + '</div><div class = "col-md-2">' + this.artistName + '</div><div class = "col-md-3">' + this.albumName + '</div>';
            toJade += '<div class = "col-md-2"><button onclick = "getLikes(' + this.trackid + ')"> Get Current Likes </button></div>'
            toJade += '<div class = "col-md-1 likes' + this.trackid + '"></div></p>';
            toJade += '</div>';
        });
    })
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
