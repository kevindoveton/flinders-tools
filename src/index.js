var $ = require("jquery-browserify");
var flinders = require("flinders-api");

function updateElements() {
    var data = flinders.bus.getBusLocation();

    $("#bus-location").text("Currently " + data.position);
    $("#progress-bar-parent").attr("data-tooltip",data.timeLeft + " seconds left");
    $("#progress-bar-child").css("width",(data.percentage * 100) + "%");
    $("#bus-next-stop").text("Next stop: " + data.nextStop);
}

$(document).ready(function() {
    updateElements();
    setInterval(updateElements,100);
});
