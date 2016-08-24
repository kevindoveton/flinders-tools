import * as cookie from "js-cookie";

let yearOverride;

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

if(!getYear() || (getYear() != getYear())) {
    setYear(2016);
}
