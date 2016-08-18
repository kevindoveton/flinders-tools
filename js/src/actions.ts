import {
    getSubscriptions,
    addSubscription as addSubscriptionInternal,
    removeSubscription as removeSubscriptionInternal,
    addWatched as watchLectureInternal,
    removeWatched as unwatchLectureInternal
} from "./lib/cookie-persist";

import {getSimple,ILectureList} from "./lib/lectures";
import * as Promise from "bluebird";

export enum EAppEvent {
    REQUEST_SUBSCRIPTIONS,
    RECEIVE_SUBSCRIPTIONS,
    UPDATED_SUBSCRIPTIONS,
    ADD_SUBSCRIPTION,
    REMOVE_SUBSCRIPTION,
    WATCH_LECTURE,
    UNWATCH_LECTURE,
}

export interface IAppEvent {
    type: EAppEvent;
}

export function requestSubscriptions():any {
    return (dispatch) => {
        dispatch({
            type: EAppEvent.REQUEST_SUBSCRIPTIONS,
        });

        let promises:Promise<ILectureList>[] = [];

        for(let sub of getSubscriptions()) {
            promises[promises.length] = getSimple(sub);
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

export function updatedSubscriptions():any {
    return (dispatch) => {
        dispatch({
            type: EAppEvent.UPDATED_SUBSCRIPTIONS,
        });

        dispatch(requestSubscriptions());
    };
}

export function addSubscription(topiccode:string):any {
    return (dispatch) => {
        dispatch({
            type: EAppEvent.ADD_SUBSCRIPTION,
            topiccode
        });

        if(addSubscriptionInternal(topiccode)) {
            dispatch(updatedSubscriptions());
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
            dispatch(updatedSubscriptions());
        }
    };
}

export function watchLecture(url:string):any {
    return (dispatch) => {
        dispatch({
            type: EAppEvent.WATCH_LECTURE,
            url
        });

        watchLectureInternal(url);
    };
}

export function unwatchLecture(url:string):any {
    return (dispatch) => {
        dispatch({
            type: EAppEvent.UNWATCH_LECTURE,
            url
        });

        unwatchLectureInternal(url);
    };
}
