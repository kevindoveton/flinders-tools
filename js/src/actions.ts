import {
    getSubscriptions,
    addSubscription as addSubscriptionInternal,
    removeSubscription as removeSubscriptionInternal,
    addWatched as watchLectureInternal,
    removeWatched as unwatchLectureInternal,
    setYear as setYearInternal,
} from "./lib/cookie-persist";

import {getSimple,ILectureList} from "./lib/lectures";
import * as Promise from "bluebird";

export enum EAppEvent {
    REQUEST_SUBJECT,
    RECEIVE_SUBJECT,
    REQUEST_SUBSCRIPTIONS,
    RECEIVE_SUBSCRIPTIONS,
    UPDATE_SUBSCRIPTIONS,
    ADD_SUBSCRIPTION,
    REMOVE_SUBSCRIPTION,
    WATCH_LECTURE,
    UNWATCH_LECTURE,
    SET_YEAR,
}

export interface IAppEvent {
    type: EAppEvent;
}

export function requestSubject(subjectcode:string):any {
    return (dispatch) => {
        dispatch({
            type: EAppEvent.REQUEST_SUBJECT,
            subjectcode
        });

        return getSimple(subjectcode)
            .then(lecturelist => dispatch(receiveSubject(subjectcode,lecturelist)))
            .catch(() => {
                console.log(`WARNING: Couldn't load lectures for ${subjectcode}!`);
            });
    };
}

export function receiveSubject(subjectcode:string,lecturelist:ILectureList):any {
    return {
        type: EAppEvent.RECEIVE_SUBJECT,
        lecturelist,
        subjectcode
    }
}

export function requestSubscriptions():any {
    return (dispatch) => {
        dispatch({
            type: EAppEvent.REQUEST_SUBSCRIPTIONS,
            subjects: getSubscriptions()
        });

        let promises:Promise<ILectureList>[] = [];

        for(let sub of getSubscriptions()) {
            promises[promises.length] = getSimple(sub).catch(() => {
                console.log(`WARNING: Couldn't load lectures for ${sub}!`);
            });;
        }

        return Promise.all(promises)
            .then(lecturelist => dispatch(receiveSubscriptions(lecturelist)));
    };
}

export function receiveSubscriptions(lecturelist:ILectureList[]):any {
    return {
        type: EAppEvent.RECEIVE_SUBSCRIPTIONS,
        subscriptions: lecturelist
    }
}

export function addSubscription(topiccode:string):any {
    return (dispatch) => {
        dispatch({
            type: EAppEvent.ADD_SUBSCRIPTION,
            topiccode
        });

        if(addSubscriptionInternal(topiccode)) {
            dispatch(requestSubscriptions());
        }
    };
}

export function removeSubscription(topiccode:string):any {
    return (dispatch) => {
        dispatch({
            type: EAppEvent.REMOVE_SUBSCRIPTION,
            topiccode
        });

        if(removeSubscriptionInternal(topiccode)) {
            dispatch(requestSubscriptions());
        }
    };
}

export function watchLecture(url:string):any {
    return (dispatch) => {
        watchLectureInternal(url);

        dispatch({
            type: EAppEvent.WATCH_LECTURE,
            url
        });
    };
}

export function unwatchLecture(url:string):any {
    return (dispatch) => {
        unwatchLectureInternal(url);

        dispatch({
            type: EAppEvent.UNWATCH_LECTURE,
            url
        });
    };
}

export function setYear(year):any {
    return (dispatch) => {
        setYearInternal(year);

        dispatch({
            type: EAppEvent.SET_YEAR,
            year
        });

        dispatch(requestSubscriptions());
    };
}
