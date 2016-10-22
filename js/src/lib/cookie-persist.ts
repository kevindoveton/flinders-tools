import * as cookie from "js-cookie";

import * as $ from "jquery";

export let version = "3.1";

declare var alertify:any;

require("persist-js");
declare var Persist:any;

let yearOverride;

namespace legacy {
    export function getYear() {
        return yearOverride || parseInt(cookie.get("ft-lecture-year"));
    }

    export function setYear(year:number) {
        cookie.set("ft-lecture-year",year);
    }

    export function getSubscriptions() {
        let subs:string[] = cookie.getJSON("ft-subs");

        if(!subs) {
            cookie.set("ft-subs",[],{expires: 36500});
            return cookie.getJSON("ft-subs");
        }

        return subs;
    }

    export function removeSubscription(topicCode:string) {
        let subscriptions = getSubscriptions();

        for(let i=0;i < subscriptions.length;i++) {
            if(subscriptions[i] == topicCode) {
                subscriptions.splice(i,1);
                cookie.set("ft-subs",subscriptions,{expires: 36500});

                return true;
            }
        }

        return false;
    }

    export function addSubscription(topicCode:string) {
        let subscriptions = getSubscriptions();

        for(let i=0;i < subscriptions.length;i++) {
            if(subscriptions[i] == topicCode) {
                return false;
            }
        }

        subscriptions[subscriptions.length] = topicCode;
        cookie.set("ft-subs",subscriptions,{expires: 36500});

        return true;
    }

    export function getWatchedList():string[] {
        let watched:any = cookie.getJSON("ft-watched-lectures");

        if(!watched) {
            cookie.set("ft-watched-lectures",[],{expires: 36500});
            return cookie.getJSON("ft-watched-lectures");
        }

        return watched;
    }

    export function isWatched(url:string) {
        let watched = getWatchedList();

        for(let i=0;i < watched.length;i++) {
            if(watched[i] == url) {
                return true;
            }
        }

        return false;
    }

    export function removeWatched(url:string) {
        let watched = getWatchedList();

        for(let i=0;i < watched.length;i++) {
            if(watched[i] == url) {
                watched.splice(i,1);
                cookie.set("ft-watched-lectures",watched,{expires: 36500});
                return true;
            }
        }

        return false;
    }

    export function addWatched(url:string) {
        let watched = getWatchedList();

        for(let i=0;i < watched.length;i++) {
            if(watched[i] == url) {
                return false;
            }
        }

        watched[watched.length] = url;
        cookie.set("ft-watched-lectures",watched,{expires: 36500});

        return true;
    }
}

let store;

Persist.remove("cookie");

function _set(k,v) {
    if(store) {
        try {
            v = JSON.stringify(v);

            if(Persist.size != -1 && Persist.size < v.length) {
                throw new Error("too much data");
            }

            store.set(k,v);
        }
        catch(e) {
            alertify.error("Could not save data! (" + e + ")",25);
        }
    }
}

function _get(k,fallback) {
    if(store) {
        let val = store.get(k);
        if(typeof val !== "undefined") {
            return JSON.parse(val);
        }
        else {
            _set(k,fallback);
            return fallback;
        }
    }
    else {
        return fallback;
    }
}

function currentYear() {
    return new Date().getFullYear();
}

function migrate() {
    if(!_get("migrated",false)) {
        if(cookie.get("ft-lecture-year")) {
            alertify.warning("Migrating to the newer storage system...",15);
        }

        if(typeof cookie.getJSON("ft-watched-lectures") !== "undefined") {
            _set("ft-watched-lectures",cookie.getJSON("ft-watched-lectures"));
        }
        if(typeof cookie.getJSON("ft-subs") !== "undefined") {
            _set("ft-subs",cookie.getJSON("ft-subs"));
        }

        if(cookie.get("ft-lecture-year")) {
            if(parseInt(cookie.get("ft-lecture-year")) == currentYear()) {
                _set("ft-lecture-year","Current Year");
            }
            else {
                _set("ft-lecture-year",parseInt(cookie.get("ft-lecture-year")));
            }
        }

        _set("lastversion","3.0");

        _set("migrated",true);
        if(cookie.get("ft-lecture-year")) {
            alertify.success("Migration successful! (this should solve some issues with lecture progress being unsaved)",15);
        }
    }

    if(_get("lastversion",version) != "version") {
        alertify.success("Hooray, an update! Hopefully you'll experience less issues with version " + version + " :)",15);
        _set("lastversion",version);
    }

    if(!_get("ft-lecture-year",false)) {
        _get("ft-lecture-year","Current Year");
    }
}

export function getYear() {
    if(yearOverride) {
        return yearOverride;
    }

    if(_get("ft-lecture-year","Current Year") == "Current Year") {
        return currentYear();
    }
    else {
        return parseInt(_get("ft-lecture-year",currentYear()));
    }
}

export function getYearInternal() {
    return _get("ft-lecture-year","Current Year");
}

export function setYear(year:number) {
    _set("ft-lecture-year",year);
}

export function getSubscriptions() {
    let subs:string[] = _get("ft-subs",[]);

    if(!subs) {
        _set("ft-subs",[]);
        return _get("ft-subs",[]);
    }

    return subs;
}

export function removeSubscription(topicCode:string) {
    let subscriptions = getSubscriptions();

    for(let i=0;i < subscriptions.length;i++) {
        if(subscriptions[i] == topicCode) {
            subscriptions.splice(i,1);
            _set("ft-subs",subscriptions);

            return true;
        }
    }

    return false;
}

export function addSubscription(topicCode:string) {
    let subscriptions = getSubscriptions();

    for(let i=0;i < subscriptions.length;i++) {
        if(subscriptions[i] == topicCode) {
            return false;
        }
    }

    subscriptions[subscriptions.length] = topicCode;
    _set("ft-subs",subscriptions);

    return true;
}

export function getWatchedList():string[] {
    let watched:any = _get("ft-watched-lectures",[]);

    if(!watched) {
        _set("ft-watched-lectures",[]);
        return _get("ft-watched-lectures",[]);
    }

    return watched;
}

export function isWatched(url:string) {
    let watched = getWatchedList();

    for(let i=0;i < watched.length;i++) {
        if(watched[i] == url) {
            return true;
        }
    }

    return false;
}

export function removeWatched(url:string) {
    let watched = getWatchedList();

    for(let i=0;i < watched.length;i++) {
        if(watched[i] == url) {
            watched.splice(i,1);
            _set("ft-watched-lectures",watched);
            return true;
        }
    }

    return false;
}

export function addWatched(url:string) {
    let watched = getWatchedList();

    for(let i=0;i < watched.length;i++) {
        if(watched[i] == url) {
            return false;
        }
    }

    watched[watched.length] = url;
    _set("ft-watched-lectures",watched);

    return true;
}

// $(() => {
    store = new Persist.Store("flinders-tools");

    migrate();
// });

if(!getYear() || (getYear() != getYear())) {
    setYear(2016);
}
