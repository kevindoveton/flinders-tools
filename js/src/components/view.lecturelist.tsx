import * as React from "react";

import {ILecture,ILectureList} from "../lib/lectures";
import {LectureItem} from "./view.lectureitem";

let Semantify = require("react-semantify");

export class InternalLectureList extends React.Component<{
    lecturedata: ILectureList[];
    videos: any;
    topicCode:string;
    requestSubject: (code:string) => void,
    loading:boolean,
},{
    lectures:ILecture[]
}> {
    constructor(props) {
        super(props);

        this.state = {
            lectures: [],
        };
    }

    getLectures(subject) {
        for(let data of this.props.lecturedata) {
            if(data.subjectcode == subject) {
                return data.lectures;
            }
        }

        this.props.requestSubject(this.props.topicCode);
        return [];
    }

    computeLectures() {
        this.state.lectures = this.getLectures(this.props.topicCode);

        this.state.lectures.sort((a,b) => {
            return b.unix - a.unix;
        });
    }

    lastLectures:number = 0;
    ignoreCall:boolean = false;
    componentDidUpdate() {
        if(this.ignoreCall) {this.ignoreCall = false;return;}
        this.computeLectures();

        if(this.lastLectures != this.state.lectures.length) {
            this.lastLectures = this.state.lectures.length;
            this.ignoreCall = true;
            this.setState(this.state);
        }
        else {
            this.ignoreCall = true;
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

        let lectureNodes = this.state.lectures.map((lecture) => {
            return <LectureItem
                isWatched={lecture.watched}
                title={lecture.title}
                date={lecture.date}
                url={lecture.url} />
        });

        if(this.state.lectures.length == 0) {
            return <h4>No lectures available...</h4>
        }

        return <div>
            <div className="ui relaxed divided list">
                {lectureNodes}
            </div>
        </div>
    }
}

import {connect} from "react-redux";
import {requestSubject} from "../actions";

function mapStateToProps(state) {
    return {
        lecturedata: state.lecturedata,
        videos: state.videos,
        loading: state.isLoading
    }
}

function mapDispatchToProps(dispatch) {
    return {
        requestSubject: (code:string) => {
            dispatch(requestSubject(code));
        }
    }
}

export const LectureList = connect(
    mapStateToProps,
    mapDispatchToProps
)(InternalLectureList);
