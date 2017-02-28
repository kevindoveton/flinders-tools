import * as cheerio from "cheerio";
import * as request from "./request";

import * as moment from "moment-timezone";

import * as Promise from "bluebird";

import {getYear,isWatched as _isWatched} from "./cookie-persist";

import {getTopics} from "./topics"

export interface ILecture {
    url: string;
    title: string;
    date: string;
    unix: number;
    isWatched: () => boolean;
    watched: boolean;
    subjectcode: string;
}

export interface ILectureList {
    lectures: ILecture[];
    subjectcode: string;
}

let endpoint = "http://video.flinders.edu.au/lectureResources/vod/";

export function get(classID:string,year:(string|number),callback:(err,lectures?:ILectureList) => void) {
    request.get(endpoint + classID.toUpperCase() + "_" + year + ".xml",(body,status) => {
        if(status == 200) {
            let $ = cheerio.load(body);

            let lectures:ILecture[] = [];

            $("channel").find("item").each((i,el) => {
                let pubDate = moment($(el).find("pubDate").text(),"ddd, DD MMM YYYY HH:mm:ss ZZ");

                let lecture:ILecture = {
                    url: $(el).find("guid").text(),
                    title: $(el).find("title").text(),
                    date: moment.duration(moment().diff(pubDate)).humanize(),
                    unix: pubDate.unix(),
                    isWatched() {
                        return _isWatched(this.url);
                    },
                    watched: _isWatched($(el).find("guid").text()),
                    subjectcode: classID
                };

                lecture.isWatched = lecture.isWatched.bind(lecture);

                lectures[lectures.length] = lecture;
            });

            lectures.sort((a,b) => {
                return b.unix - a.unix;

            });

            callback(null,{
                lectures,
                subjectcode: classID
            });
        }
        else {
            callback("HTTP status code is " + status + " (not 200!)");
        }
    });
}

export function getWithUserDefinedYear(classID:string,callback:(err,lectures:ILectureList) => void) {
    return get(classID,getYear(),callback);
}

export function getSimple(classID:string) {
    return new Promise<ILectureList>((resolve,reject) => {
        getWithUserDefinedYear(classID,(err,lectures:ILectureList) => {
            if(err) {
                // reject(err);
                resolve({
                    lectures: [],
                    subjectcode: classID,
                });
            }
            else {
                resolve(lectures);
            }
        });
    });
}

export interface ITopic {
    id: number;
    name: string;
    code: string;
    year: string;
    semester: string;
    location: string;
}

export function topicInfo(topicID:string):ITopic {
    let topics = getTopics();
    for(let i=0;i < topics.length;i++) {
        let topic = topics[i];
        if(topic.code == topicID) {
            return topic;
        }
    }

    return {
        id: 0,
        code: topicID,
        name: "Unknown subject",
        year: "0",
        semester: "S1",
        location: "Bedford Park"
    }
}
