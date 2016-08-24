import * as $ from "jquery";

import * as Promise from "bluebird";

let w:any = window;

w.internal_cors_callback_index = 0;
export function get(url,callback:(contents:string,code:number) => void) {
    w.internal_cors_callback_index++;

    let cb = "cb_" + w.internal_cors_callback_index;

    let callback2:any = (data) => {
        callback(data.contents,data.status.http_code);
    };

    window[cb] = callback2;

    $("body").append("<script src='https://whateverorigin.herokuapp.com/get?url=" + encodeURIComponent(url) + "&callback=" + cb + "'></script>");
}

export interface IResponse {
    contents:string;
    code:number;
}

export function getPromise(url) {
    return new Promise<IResponse>((resolve,reject) => {
        get(url,(contents,code) => {
            resolve({
                contents,
                code
            });
        });
    });
}

// export function post(url,callback) {
//     let cb = "C" + Math.floor(Math.random()*10^6);

//     window[cb] = callback;

//     $("body").append("<script src='https://whateverorigin.herokuapp.com/post?url=" + encodeURIComponent(url) + "&callback=" + cb + "'></script>");
// }
