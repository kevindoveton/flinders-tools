/// <reference path="../../typings/index.d.ts" />

import {getYear} from "./lib/cookie-persist";
import {ILectureList,ILecture} from './lib/lectures'
import {EAppEvent} from './actions'
import * as update from "react-addons-update";

export interface IAppState {
    subscriptions: string[];
    lecturedata: ILectureList[];

    videos: {[url:string]: ILecture};

    isLoading: boolean;

    year:number;
}

const initialState:IAppState = {
    subscriptions: [],
    lecturedata: [],

    videos: {},

    isLoading: false,

    year: getYear(),
}

namespace helpers {
    export function fillLectureData(state:IAppState,subjectcode):IAppState {
        let exists = false;

        for(let data of state.lecturedata) {
            if(data.subjectcode == subjectcode) {
                exists = true; break;
            }
        }

        let newlecturedata = state.lecturedata;

        if(!exists) {
            newlecturedata = update(state.lecturedata,{
                $push: [
                    {
                        lectures: [],
                        subjectcode: subjectcode
                    }
                ]
            });
        }
        else {
            let newlecturedata = [];
        }

        return <any>update(state,{
            lecturedata: {
                $merge: newlecturedata
            }
        });
    }

    export function fillBulkLectureData(state:IAppState,subjectcode:string[]) {
        for(let code of subjectcode) {
            state = <any>fillLectureData(state,code);
        }

        return state;
    }

    function forEachVideo(lecturelist:ILectureList,callback:(lecture:ILecture,lectureIdx:number) => void) {
        let lectureIdx = 0;
        for(let lecture of lecturelist.lectures) {
            callback(lecture,lectureIdx);
            lectureIdx++;
        }
    }

    function forEachVideoEx(lecturelist:ILectureList[],callback:(lecture:ILecture,lectureIdx:number) => void) {
        for(let lectures of lecturelist) {
            forEachVideo(lectures,callback);
        }
    }

    export function updateLectureData(state:IAppState,lecturedata:ILectureList):IAppState {
        forEachVideo(lecturedata,(lecture) => {
            state = <any>update(state,{
                videos: {
                    [lecture.url]: {
                        $set: lecture
                    }
                }
            });
        });

        let i = 0;
        for(let data of state.lecturedata) {
            if(data.subjectcode == lecturedata.subjectcode) {
                return <any>update(state,{
                    lecturedata: {
                        [i]: {
                            $set: lecturedata
                        }
                    }
                });
            }

            i++;
        }

        return <any>update(state,{
            lecturedata: {
                $push: [
                    lecturedata
                ]
            }
        });
    }

    export function updateBulkLectureData(state:IAppState,lecturelist:ILectureList[]) {
        for(let data of lecturelist) {
            state = <any>updateLectureData(state,data);
        }

        return state;
    }

    export function watchLecture(state:IAppState,url:string,watched:boolean) {
        let i = 0;
        for(let lecturedata of state.lecturedata) {
            forEachVideo(lecturedata,(lecture,lectureIdx) => {
                if(lecture.url != url) {return;}
                state = <any>update(state,{
                    lecturedata: {
                        [i]: {
                            lectures: {
                                [lectureIdx]: {
                                    watched: {$set: watched}
                                }
                            }
                        }
                    },
                    videos: {
                        [lecture.url]: {
                            watched: {$set: watched}
                        }
                    }
                });
            });
            i++;
        }
        return state;
    }
}

export default function app(state:IAppState = initialState,action) {
    switch(action.type) {
        case EAppEvent.REQUEST_SUBJECT: {
            let newdata = helpers.fillLectureData(state,action.subjectcode);

            return update(newdata,{
                isLoading: {
                    $set: true
                }
            });
        };
        case EAppEvent.RECEIVE_SUBJECT: {
            let newdata = helpers.updateLectureData(state,action.lecturelist);

            return update(newdata,{
                isLoading: {
                    $set: false
                }
            });
        };
        case EAppEvent.REQUEST_SUBSCRIPTIONS: {
            return update(helpers.fillBulkLectureData(state,action.subjects),{
                isLoading: {$set: true},
                subscriptions: {$set: action.subjects}
            });
        };
        case EAppEvent.RECEIVE_SUBSCRIPTIONS: {
            let newdata = helpers.updateBulkLectureData(state,action.subscriptions);

            return update(newdata,{
                isLoading: {
                    $set: false
                }
            });
        };
        case EAppEvent.WATCH_LECTURE: {
            return helpers.watchLecture(state,action.url,true);
        };
        case EAppEvent.UNWATCH_LECTURE: {
            return helpers.watchLecture(state,action.url,false);
        };
        default: {
            return state;
        };
        case EAppEvent.SET_YEAR: {
            return update(state,{
                year: {$set: action.year}
            });
        };
    }
}
