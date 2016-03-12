var flinders = require("flinders-api");

var options = {
    valueNames: ["name","code"],
    searchClass: "search-thing",
    item: "<li><a href=\"#!\" class=\"truncate class-result\"><span class=\"code\"></span> - <span class=\"name\"></span></a></li>",
    indexAsync: true,
    page: 50
};

function XGet(url,callback) {
    var cb = "C" + Math.floor(Math.random()*10^6);

    window[cb] = callback;

    $("body").append("<script src='https://whateverorigin.herokuapp.com/get?url=" + encodeURIComponent(url) + "&callback=" + cb + "'></script>");
}

var userList = new List("subjectList",options,topicDatabase.data);
userList.sort("item-subject",{order: "asc"});

function proxy(dura,fn) {
    dura *= 1000;
    var lastcalled = 0;
    function proxied() {
        if(Date.now() - lastcalled >= dura) {
            lastcalled = Date.now();
            fn.apply(null,arguments);
        }
        else {
            setTimeout(function() {
                if(Date.now() - lastcalled >= dura) {
                    lastcalled = Date.now();
                    fn.apply(null,arguments);
                }
            },(2000 - (Date.now() - lastcalled)))
        }
    }
    return proxied
}

$(document).ready(function() {
    Materialize.toast("Click a topic to view all available lecture recordings",4500)
    var idx = 0;
    function lookupVideo() {
        Materialize.toast("Loading...",1500,"blue")
        XGet("http://video.flinders.edu.au/lectureResources/vod/" + $(this).find(".code").text().toUpperCase() + "_2016.xml",function(res) {
            if(res.status.http_code == 200) {
                var data = $.parseXML(res.contents).children[0].children[0].children;

                if(data.length == 0) {
                    Materialize.toast("No videos available!",3000,"red")
                    return;
                }

                Materialize.toast("Loading complete",3000,"green")
                $("#accordion").remove();


                $(".container").append(
                    $(document.createElement("ul"))
                        .attr("id","accordion")
                        .attr("class","collapsible popout")
                        .attr("data-collapsible","accordion")
                );

                for(var i=0;i < data.length;i++) {
                    idx++;
                    if(data[i].tagName === "item") {
                        var doc = $(data[i]);
                        var li = $(document.createElement("li"));
                        li.append(
                            $(document.createElement("div"))
                                .attr("class","collapsible-header")
                                .text(doc.find("title").text())
                                .append(
                                    $(document.createElement("i"))
                                        .attr("class","material-icons")
                                        .text("comment")
                                )
                        ).append(
                            $(document.createElement("div"))
                                .attr("class","collapsible-body")
                                .append(
                                    $(document.createElement("video"))
                                        .attr("class","video-js vjs-default-skin")
                                        .attr("id","video-" + idx)
                                        .attr("preload","none")
                                        .prop("controls",true)
                                        .css("width","100%")
                                        .css("height","350px")
                                        .append(
                                            $(document.createElement("source"))
                                                .attr("src",doc.find("enclosure").attr("url"))
                                                .attr("type","video/mp4")
                                        )
                                )
                        );
                        $("#accordion").append(li);

                        videojs("video-" + idx,{
                            playbackRates: [
                                0.25,
                                0.5,
                                0.75,
                                1,
                                1.25,
                                1.5,
                                1.75,
                                2
                            ]
                        });

                        $("#video-" + idx)
                            .css("width","")
                            .css("height","");
                    }

                    $("#accordion").collapsible({
                        accordion: true
                    });
                }
            }
            else {
                Materialize.toast("No videos available!",3000,"red")
            }
        });
    }

    function updateHook() {
        $(".class-result").off("click","",lookupVideo);
        $(".class-result").on("click","",lookupVideo);
    }

    updateHook();
    userList.on("updated",updateHook);
});
