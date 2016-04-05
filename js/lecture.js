function hashFnv32a(str, asString, seed) {
    /*jshint bitwise:false */
    var i, l,
        hval = (seed === undefined) ? 0x811c9dc5 : seed;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    if( asString ){
        // Convert to 8 digit hex string
        return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
    }
    return hval >>> 0;
}

// var flinders = require("flinders-api");

//from https://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/11582513
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

var options = {
    valueNames: ["name","code"],
    searchClass: "search-thing",
    item: "<li><a href=\"javascript:void(0);\" class=\"truncate class-result\"><span class=\"code\"></span> - <span class=\"name\"></span></a></li>",
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
            },(2000 - (Date.now() - lastcalled)));
        }
    }
    return proxied;
}

var video_idx = 0;
function lookupVideo(unused,topic) {
    topic = topic || $(this).find(".code").text().toUpperCase();

    History.pushState({
        topic: topic
    },"FUTools - Lectures - " + topic,"?topic=" + topic);
}

function getVideo(topic) {
    $("#main-loader").fadeIn(1000);
    Materialize.toast("Loading...",1500,"blue");
    XGet("http://video.flinders.edu.au/lectureResources/vod/" + topic + "_2016.xml",function(res) {
        $("#main-loader").fadeOut(100);
        if(res.status.http_code == 200) {
            var data = $.parseXML(res.contents).children[0].children[0].children;

            if(data.length === 0) {
                Materialize.toast("No videos available!",3000,"red");
                return;
            }

            Materialize.toast("Loading compvare",3000,"green");
            $("#accordion").remove();

            $(".container").append(
                $(document.createElement("ul"))
                    .attr("id","accordion")
                    .attr("class","collapsible popout")
                    .attr("data-collapsible","accordion")
            );

            for(var i=0;i < data.length;i++) {
                if(data[i].tagName === "item") {
                    video_idx++;
                    var doc = $(data[i]);
                    var li = $(document.createElement("li"));

                    var videoHash = hashFnv32a(doc.find("guid").text(),true);

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
                                    .attr("id","video-" + video_idx)
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

                    li.addClass("lecture-option");
                    li.attr("data-video-hash",videoHash);

                    if(getURLParameter("vid") && getURLParameter("vid") === videoHash) {
                        li.find(".collapsible-header").addClass("active");
                    }

                    if(Cookies.get("seen-lecture-" + videoHash) === "true") {
                        li.find(".collapsible-header").append(
                            $(document.createElement("div"))
                                .attr("class","chip")
                                .css("margin-left","5px")
                                .text("Seen")
                        );
                    }

                    videojs("video-" + video_idx,{
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
                    }).ready(function() {
                        this.hotkeys({
                            volumeStep: 0.1,
                            seekStep: 2
                        });
                    });

                    $("#video-" + video_idx + "_html5_api")
                        .css("width","")
                        .css("height","");
                }
            }

            $("#accordion").collapsible({
                accordion: true
            });

            $(".lecture-option").click(function() {
                var hash = $(this).attr("data-video-hash");

                History.pushState({
                    topic: topic,
                    vid: hash
                },"FUTools - Lectures - " + topic,"?topic=" + topic + "&vid=" + hash);

                Cookies.set("seen-lecture-" + hash,"true");
            });
        }
        else {
            Materialize.toast("No videos available!",3000,"red");
        }
    });
}

var currentTopic;
var currentVid;

History.Adapter.bind(window,"statechange",function() {
    var State = History.getState();

    var topic = State.data.topic;
    var vid = State.data.vid;

    if(!topic) {return;}

    if(topic === currentTopic) {return;}
    if(vid && (vid === currentVid)) {return;}

    currentTopic = topic;
    currentVid = vid;

    getVideo(topic);
});

$(document).ready(function() {
    // Materialize.toast("Click a topic to view all available lecture recordings",4500);

    $("#main-loader").fadeOut(1);

    function updateHook() {
        $(".class-result").off("click","",lookupVideo);
        $(".class-result").on("click","",lookupVideo);
    }

    updateHook();
    userList.on("updated",updateHook);

    if(getURLParameter("topic")) {
        getVideo(getURLParameter("topic"));
    }
});
