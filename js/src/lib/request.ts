import * as $ from "jquery";

export function get(url,callback) {
    let cb;
    
    do {
        cb = "C" + Math.floor(Math.random()*10^6);
    }
    while(window[cb]);

    let callback2:any = (data) => {
        callback(data.contents,data.status.http_code);
    };

    window[cb] = callback2;

    $("body").append("<script src='https://whateverorigin.herokuapp.com/get?url=" + encodeURIComponent(url) + "&callback=" + cb + "'></script>");
}

// export function post(url,callback) {
//     let cb = "C" + Math.floor(Math.random()*10^6);

//     window[cb] = callback;

//     $("body").append("<script src='https://whateverorigin.herokuapp.com/post?url=" + encodeURIComponent(url) + "&callback=" + cb + "'></script>");
// }
