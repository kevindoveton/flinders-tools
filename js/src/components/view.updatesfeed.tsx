/// <reference path="../../../typings/index.d.ts" />

import * as React from "react";
import {Link} from "react-router";

import * as b64 from "js-base64";
import {ILectureList} from "../lib/lectures";

export interface ILectureEvent {
    unix: number;
    subjectCode: string;
    title: string;
    date: string;
    url: string;
    watched: boolean;
}

export class InternalLectureSubscriptionUpdates extends React.Component<{
    subscriptions:string[],
    lecturedata: ILectureList[];
    loading: boolean;
    watchLecture: (url) => void;
},{
    events: ILectureEvent[]
}> {
    constructor() {
        super();

        this.state = {
            events: []
        };
    }

    getLectures(subject) {
        for(let data of this.props.lecturedata) {
            if(data.subjectcode == subject) {
                return data.lectures;
            }
        }

        return [];
    }

    computeEvents() {
        this.state.events = [];

        for(let i=0;i < this.props.subscriptions.length;i++) {
            let subjectCode = this.props.subscriptions[i];
            let lectures = this.getLectures(subjectCode);

            for(let i=0;i < lectures.length;i++) {
                this.state.events[this.state.events.length] = {
                    unix: lectures[i].unix,
                    title: lectures[i].title,
                    url: lectures[i].url,
                    date: lectures[i].date,
                    subjectCode: subjectCode,
                    watched: lectures[i].watched
                }
            }

            this.state.events.sort((a,b) => {
                return b.unix - a.unix;
            });
        }
    }

    // lastEvents:number = 0;
    // componentDidUpdate() {
    //     this.computeEvents();

    //     if(this.lastEvents != this.state.events.length) {
    //         this.lastEvents = this.state.events.length;
    //         this.setState(this.state);
    //     }
    // }

    // componentDidMount() {
    //     this.componentDidUpdate();
    // }

    render() {
        this.computeEvents();

        if(this.props.loading) {
            return <div className="ui segment">
                <p></p>
                <div className="ui active dimmer">
                    <div className="ui loader"></div>
                </div>
            </div>;
        }

        let n = 0;
        let subs = this.state.events.map((event,i) => {
            if(event.watched) {return;}
            if(n > 20) {return;}
            n++;

            let redirect = "/topic/" + event.subjectCode;
            let target = "/vid/" + b64.Base64.encodeURI(event.url);
            let btnStyle = {
                cursor: "pointer"
            };

            return <div className="event">
                <div className="ui content event">
                    <div className="summary">
                        <Link to={redirect} className="user">{event.subjectCode}</Link> added a new
                        <Link to={target} className="user">&nbsp;video</Link>&nbsp;
                        <i style={btnStyle} className="checkmark icon" onClick={() => this.props.watchLecture(event.url)}></i>
                        <div className="date">{event.date} ago</div>
                    </div>
                </div>
            </div>;
        });

        if(this.state.events.length == 0) {
            subs = [<div>You're up to date, well done!</div>];
        }

        return <div className="ui relaxed feed">{subs}</div>;
    }
}

import {connect} from "react-redux";

import {watchLecture} from "../actions";

function mapStateToProps(state) {
    return {
        loading: state.isLoading,
        subscriptions: state.subscriptions,
        lecturedata: state.lecturedata,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        watchLecture: (url) => {
            dispatch(watchLecture(url))
        }
    }
}

export const LectureSubscriptionUpdates = connect(
    mapStateToProps,
    mapDispatchToProps
)(InternalLectureSubscriptionUpdates);
