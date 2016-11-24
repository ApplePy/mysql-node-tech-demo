/**
 * Created by danazagar on 2016-11-23.
 */
$(document).ready(function(){
    $("#mytracks").on("click", getTracks);
})

function getTracks(){
    $.getJSON('/api/mytracks', function(data){

        var toJade = "";
        $.each(data, function(){
            var minutes = Math.floor(this.trackLength/60);
            var seconds = this.trackLength % 60;
            toJade += '<div class = "row">';
            toJade += '<p>' + this.trackName + '  |  ' + minutes + ':' + seconds + '  |  ' + this.artistName + '  |  ' + this.albumName + '</p>';
            toJade += '</div>';
        });
        $('.col-sm-10').append(toJade);
    });
}

