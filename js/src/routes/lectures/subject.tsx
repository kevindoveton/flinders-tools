import {Page} from "../base";

import * as $ from "jquery";
import * as React from "react";
import * as ReactDOM from "react-dom";

import * as cookie from "js-cookie";

import * as lectures from "../../lib/lectures";

import * as querystring from "querystring";

let yearOverride;

function getYear() {
    return yearOverride || parseInt(cookie.get("ft-lecture-year"));
}

let Semantify = require("react-semantify");
let plyr = require("plyr");

class LectureViewModal extends React.Component<{url:string},{playbackSpeed:number}> {
    player:any;
    lastSource:string;

    constructor(props) {
        super(props);

        this.state = {
            playbackSpeed: 1
        }
    }

    componentDidMount() {
        window["$"]("#viewLectureModal").modal({
            onHide: this.close.bind(this)
        });

        this.player = plyr.setup('#mainVideo',{

        });
    }

    close() {
        this.player[0].plyr.pause();
    }

    componentDidUpdate() {
        if(this.lastSource != this.props.url) {
            this.state.playbackSpeed = 1;
            // this.player = plyr.setup('#mainVideo',{

            // });

            this.player[0].plyr.source({
                type: "video",
                // title: this.props.title,
                sources: [
                    {
                        src: this.props.url,
                        type: "video/mp4"
                    }
                ]
            });
            this.lastSource = this.props.url;
        }
        $(this.player[0]).find("video").get(0)["playbackRate"] = this.state.playbackSpeed;
    }

    speedUp() {
        this.state.playbackSpeed += 0.25;
        this.setState(this.state);
    }

    slowDown() {
        this.state.playbackSpeed -= 0.25;
        this.setState(this.state);
    }

    render() {
        return <div className="ui basic modal" id="viewLectureModal">
            <i className="close icon"></i>
            <div className="header" src_placeholder={this.props.url}>Lecture Player 2.0 (@ {this.state.playbackSpeed}x speed)</div>
            <div className="content">
                <div className="description">
                    <video id="mainVideo" controls></video>
                </div>
            </div>
            <div className="actions">
                <div className="two fluid ui inverted buttons">
                    <div onClick={this.speedUp.bind(this)} className="ui basic inverted button">
                    Speed up
                    </div>
                    <div onClick={this.slowDown.bind(this)} className="ui basic inverted button">
                    Slow down
                    </div>
                </div>
            </div>
        </div>
    }
}

class LectureItem extends React.Component<{title:string,date:string,url:string,viewLecture:(url:string)=>void},{watched:boolean}> {
    constructor(props) {
        super(props);

        this.state = {
            watched: false
        }
    }

    viewLecture() {
        this.props.viewLecture(this.props.url);
        this.addWatched(this.props.url);
        this.state.watched = true;
        this.setState(this.state);
    }

    getWatchedList():string[] {
        let watched:any = cookie.getJSON("ft-watched-lectures");

        if(!watched) {
            cookie.set("ft-watched-lectures",[]);
            return cookie.getJSON("ft-watched-lectures");
        }

        return watched;
    }

    isWatched(url:string) {
        let watched = this.getWatchedList();

        for(let i=0;i < watched.length;i++) {
            if(watched[i] == url) {
                return true;
            }
        }

        return false;
    }

    removeWatched(url:string) {
        let watched = this.getWatchedList();

        for(let i=0;i < watched.length;i++) {
            if(watched[i] == url) {
                watched.splice(i,1);
                cookie.set("ft-watched-lectures",watched);
                return true;
            }
        }

        return false;
    }

    addWatched(url:string) {
        let watched = this.getWatchedList();

        for(let i=0;i < watched.length;i++) {
            if(watched[i] == url) {
                return false;
            }
        }

        watched[watched.length] = url;
        cookie.set("ft-watched-lectures",watched);

        return true;
    }

    componentDidMount() {
        this.state.watched = this.isWatched(this.props.url);
        this.setState(this.state);
    }

    unwatch() {
        this.removeWatched(this.props.url);
        this.state.watched = false;
        this.setState(this.state);
    }

    render() {
        let watched = [];

        if(this.state.watched) {
            watched = [<div className="ui horizontal label">Watched<i onClick={this.unwatch.bind(this)} className="delete icon"></i></div>];
        }

        return <div className="item">
            <div className="content">
                <a className="header" onClick={this.viewLecture.bind(this)}>
                    {this.props.title}
                </a>
                <div className="description">{this.props.date} ago {watched}</div>
            </div>
        </div>
    }
}

interface ILectureItem {
    unix: number;
    subjectCode: string;
    title: string;
    date: string;
    url: string;
}

class LectureList extends React.Component<{topicCode:string},{activeURL:string,loading:boolean,lectures:ILectureItem[]}> {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            lectures: [],
            activeURL: ""
        };
    }

    componentDidMount() {
        lectures.get(this.props.topicCode,getYear(),(err,lectures) => {
            for(let i=0;i < lectures.length;i++) {
                this.state.lectures[this.state.lectures.length] = {
                    unix: lectures[i].unix,
                    title: lectures[i].title,
                    url: lectures[i].url,
                    date: lectures[i].date,
                    subjectCode: this.props.topicCode
                }
            }

            this.state.lectures.sort((a,b) => {
                return b.unix - a.unix;
            });

            this.state.loading = false;

            this.setState(this.state);
        });
    }

    viewLecture(url:string) {
        this.state.activeURL = url;
        this.setState(this.state);

        window["$"]("#viewLectureModal").modal("show");
    }

    render() {
        if(this.state.loading) {
            return <div className="ui segment">
                <p></p>
                <div className="ui active dimmer">
                    <div className="ui loader"></div>
                </div>
            </div>;
        }

        let lectureNodes = this.state.lectures.map((lecture) => {
            return <LectureItem viewLecture={this.viewLecture.bind(this)} title={lecture.title} date={lecture.date} url={lecture.url} />
        });

        if(this.state.lectures.length == 0) {
            return <h4>No lectures available...</h4>
        }

        return <div>
            <LectureViewModal url={this.state.activeURL} />
            <div className="ui relaxed divided list">
                {lectureNodes}
            </div>
        </div>
    }
}

export class LectureSubject extends Page {
    initialise() {}

    back() {
        history.go(-1);
    }

    render(data) {
        yearOverride = querystring.parse(data.querystring).year;

        $("title").text("Lecture Viewer 2.0");

        ReactDOM.render(
            <Semantify.Container>
                <div className="ui right floated button" onClick={this.back}>Back</div>
                <h1>Lecture Viewer 2.0</h1>
                <h2>{data.params.topicCode}</h2>
                <LectureList topicCode={data.params.topicCode} />
            </Semantify.Container>,
            $("#stage").get(0)
        )
    }
}
