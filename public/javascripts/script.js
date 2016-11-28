/**
 * Created by danazagar on 2016-11-23.
 */
$(document).ready(function(){
    $("#mytracks").on("click", getTracks);
    $("#top50tracks").on("click", getTop50Tracks);
    $("#alltracks").on("click", getAllTracksAccessible);
});

function getAllTracksAccessible(){
    $('.trackListing').empty();
    $.getJSON('/api/alltracks', function(data){
        var toJade = "";
        $.each(data, function(){
            var minutes = Math.floor(this.trackLength/60);
            var seconds = this.trackLength % 60;
            toJade += '<div class = "row">';
            toJade += '<p>' + this.trackName + '  |  ' + minutes + ':' + seconds + '  |  ' + this.artistName + '  |  ' + this.albumName;
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
            var minutes = Math.floor(this.trackLength/60);
            var seconds = this.trackLength % 60;
            toJade += '<div class = "row">';
            toJade += '<p>' + this.trackName + '  |  ' + minutes + ':' + seconds + '  |  ' + this.artistName + '  |  ' + this.albumName;
            toJade += '  |  <button onclick = "getLikes(' + this.trackid + ')"> Get Current Likes </button>'
            toJade += '<div class = "likes' + this.trackid + '"></div></p>';
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
            var minutes = Math.floor(this.trackLength/60);
            var seconds = this.trackLength % 60;
            toJade += '<div class = "row">';
            toJade += '<p>' + this.trackName + '  |  ' + minutes + ':' + seconds + '  |  ' + this.artistName + '  |  ' + this.albumName + '  |  ' + this.likes + '</p>';
            toJade += '</div>';
        });
        $('.trackListing').append(toJade);
    });
}

function getLikes(trackid){
    $.getJSON(('/api/likes/' + trackid), function(data){
        $('.likes' + trackid).append(data);
    });
}

