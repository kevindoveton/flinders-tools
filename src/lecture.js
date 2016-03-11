var flinders = require("flinders-api");

var options = {
    valueNames: ["item-subject"],
    searchClass: "search-thing"
};

var userList = new List("subjectList",options);
userList.sort("item-subject",{order: "asc"});

function proxy(fn) {
    var lastcalled = 0;
    function proxied() {
        if(Date.now() - lastcalled >= 2000) {
            lastcalled = Date.now();
            fn.apply(null,arguments);
        }
        else {
            setTimeout(function() {
                if(Date.now() - lastcalled >= 2000) {
                    lastcalled = Date.now();
                    fn.apply(null,arguments);
                }
            },(2000 - (Date.now() - lastcalled)))
        }
    }
    return proxied
}

$(document).ready(function() {
    $("#search").on("input",proxy(function(a,b) {
        var text = $("#search").val();

        if(text !== "") {
            flinders.timetable.getTopicList({
                year: 2016,
                subjectName: text
            },console.log);
        }
    }));
});
