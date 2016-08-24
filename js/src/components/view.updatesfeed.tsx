/// <reference path="../../../typings/index.d.ts" />

import * as React from "react";
import {Link} from "react-router";

import {ILectureList} from "../lib/lectures";

export interface ILectureEvent {
    unix: number;
    subjectCode: string;
    title: string;
    date: string;
    url: string;
}

export class InternalLectureSubscriptionUpdates extends React.Component<{
    subscriptions:string[],
    lecturedata: ILectureList[];
    loading: boolean
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
                    subjectCode: subjectCode
                }
            }

            this.state.events.sort((a,b) => {
                return b.unix - a.unix;
            });
        }
    }

    lastEvents:number = 0;
    componentDidUpdate() {
        this.computeEvents();

        if(this.lastEvents != this.state.events.length) {
            this.lastEvents = this.state.events.length;
            this.setState(this.state);
        }
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    render() {
        if(this.props.loading) {
            return <div className="ui segment">
                <p></p>
                <div className="ui active dimmer">
                    <div className="ui loader"></div>
                </div>
            </div>;
        }

        let subs = this.state.events.map((event,i) => {
            if(i > 20) {return;}
            let redirect = "/topic/" + event.subjectCode;

            return <div className="event">
                <div className="ui content event">
                    <div className="summary">
                        <Link to={redirect} className="user">{event.subjectCode}</Link> added a new
                        <Link to={redirect} className="user">&nbsp;video</Link>
                        <div className="date">{event.date} ago</div>
                    </div>
                </div>
            </div>;
        });

        if(this.state.events.length == 0) {
            subs = [<div>Nothing new happened, check back later.</div>];
        }

        return <div className="ui relaxed feed">{subs}</div>;
    }
}

import {connect} from "react-redux";

function mapStateToProps(state) {
    return {
        loading: state.isLoading,
        subscriptions: state.subscriptions,
        lecturedata: state.lecturedata,
    }
}

function mapDispatchToProps(dispatch) {
    return {

    }
}

export const LectureSubscriptionUpdates = connect(
    mapStateToProps,
    mapDispatchToProps
)(InternalLectureSubscriptionUpdates);
