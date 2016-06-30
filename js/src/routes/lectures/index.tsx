import {Page} from "../base";

import * as $ from "jquery";
import * as React from "react";
import * as ReactDOM from "react-dom";

import * as cookie from "js-cookie";

import * as lectures from "../../lib/lectures";

import * as querystring from "querystring";

let Semantify = require("react-semantify");

let yearOverride;

function getYear() {
    return yearOverride || parseInt(cookie.get("ft-lecture-year"));
}

class LectureSubscription extends React.Component<{code:string,addSub:(topicCode:string)=>boolean,removeSub:(topicCode:string)=>boolean},{}> {
    constructor(props) {
        super(props);
    }

    unsubscribe() {
        this.props.removeSub(this.props.code);
    }

    render() {
        let redirectURL = "./lectures/" + this.props.code;
        return <Semantify.Item>
            <Semantify.Content className="right floated">
                <a href={redirectURL}>
                    <Semantify.Button className="blue">
                        Watch
                    </Semantify.Button>
                </a>
                <Semantify.Button className="red" onClick={this.unsubscribe.bind(this)}>
                    Unsubscribe
                </Semantify.Button>
            </Semantify.Content>
            <Semantify.Content>
                <Semantify.Header>
                    {this.props.code}
                </Semantify.Header>
                <div className="description">
                    {lectures.topicInfo(this.props.code).name}
                </div>
            </Semantify.Content>
        </Semantify.Item>;
    }
}

class LectureAdditionModal extends React.Component<{addSub:(topicCode:string)=>boolean,removeSub:(topicCode:string)=>boolean},{}> {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        window["$"]("#addLectureModal").modal();
        let list = require("../../topics").topicDatabase;

        window["$"]("#addLectureSearchBox").search({
            source: list,
            searchFields: [
                "code",
                "name"
            ],
            cache: false,
            fields: {
                title: "code",
                description: "name"
            }
        });
    }

    subscribe() {
        let code = $("#topicSearchBox").val();

        this.props.addSub(code);

        $("#topicSearchBox").val("");
    }

    render() {
        return <div className="ui modal" id="addLectureModal">
            <i className="close icon"></i>
            <div className="header">Topic Selection</div>
            <div className="content">
                <div className="description">
                    <div className="ui header">Type in a subject code</div>
                        <div className="ui search" id="addLectureSearchBox">
                            <input className="prompt" id="topicSearchBox" placeholder={getYear() + " Topics..."} type="text" />
                            <div className="results"></div>
                        </div>
                    </div>
                </div>
                <div className="actions">
                    <div className="ui black deny button">Cancel</div>
                <div onClick={this.subscribe.bind(this)} className="ui positive right labeled icon button">
                    Subscribe
                    <i className="checkmark icon"></i>
                </div>
            </div>
        </div>
    }
}

class LectureSubscriptions extends React.Component<{subscriptions:string[],addSub:(topicCode:string)=>boolean,removeSub:(topicCode:string)=>boolean},{}> {
    constructor(props) {
        super(props);
    }

    addTopic() {
        window["$"]("#addLectureModal").modal("show");
    }

    render() {
        let subs = this.props.subscriptions.map((subjectCode) => {
            return <LectureSubscription addSub={this.props.addSub} removeSub={this.props.removeSub} key={subjectCode} code={subjectCode}></LectureSubscription>
        });

        subs[subs.length] = <Semantify.Item>
            <Semantify.Content className="right floated">
                <Semantify.Button className="green" onClick={this.addTopic}>
                    Add a topic
                </Semantify.Button>
            </Semantify.Content>
        </Semantify.Item>;

        return <Semantify.List className="middle aligned divided list">{subs}</Semantify.List>;
    }
}

interface ILectureEvent {
    unix: number;
    subjectCode: string;
    title: string;
    date: string;
    url: string;
}

class LectureSubscriptionUpdates extends React.Component<{subscriptions:string[]},{events: ILectureEvent[],loaded: boolean}> {
    constructor(props) {
        super(props);

        this.state = {
            events: [],
            loaded: false
        };
    }

    componentDidMount() {
        if(this.props.subscriptions.length == 0) {
            this.state.loaded = true;
            this.setState(this.state);
            return;
        }

        this.state.loaded = false;
        this.state.events = [];
        this.setState(this.state);

        for(let i=0;i < this.props.subscriptions.length;i++) {
            let subjectCode = this.props.subscriptions[i];
            lectures.get(subjectCode,getYear(),(err,lectures) => {
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

                this.state.loaded = true;

                this.setState(this.state);
            });
        }
    }

    lastSubscriptions:number;
    componentDidUpdate() {
        if(typeof this.lastSubscriptions !== "number") {
            this.lastSubscriptions = this.props.subscriptions.length;
            return;
        }

        if(this.lastSubscriptions != this.props.subscriptions.length) {
            this.lastSubscriptions = this.props.subscriptions.length;
            this.componentDidMount();
        }
    }

    render() {
        if(!this.state.loaded) {
            return <div className="ui segment">
                <p></p>
                <div className="ui active dimmer">
                    <div className="ui loader"></div>
                </div>
            </div>;
        }

        let subs = this.state.events.map((event,i) => {
            if(i > 20) {return;}
            let redirect = "./lectures/" + event.subjectCode;

            return <div className="event">
                <Semantify.Content className="event">
                    <div className="summary">
                        <a href={redirect} className="user">{event.subjectCode}</a> added a new video.
                        <div className="date">{event.date} ago</div>
                    </div>
                </Semantify.Content>
            </div>;
        });

        if(this.state.events.length == 0) {
            subs = [<div>Nothing new happened, check back later.</div>];
        }

        return <Semantify.Feed className="relaxed">{subs}</Semantify.Feed>;
    }
}

class LecturesApp extends React.Component<{},{subscriptions:string[]}> {
    constructor(props) {
        super(props);

        this.state = {
            subscriptions: this.getSubscriptions()
        }
    }

    getSubscriptions() {
        let subs:any = cookie.getJSON("ft-subs");

        if(!subs) {
            cookie.set("ft-subs",[],{expires: 36500});
            return cookie.getJSON("ft-subs");
        }

        return subs;
    }

    removeSubscription(topicCode:string) {
        for(let i=0;i < this.state.subscriptions.length;i++) {
            if(this.state.subscriptions[i] == topicCode) {
                this.state.subscriptions.splice(i,1);
                cookie.set("ft-subs",this.state.subscriptions,{expires: 36500});
                this.setState(this.state);
                return true;
            }
        }

        return false;
    }

    addSubscription(topicCode:string) {
        for(let i=0;i < this.state.subscriptions.length;i++) {
            if(this.state.subscriptions[i] == topicCode) {
                return false;
            }
        }

        this.state.subscriptions[this.state.subscriptions.length] = topicCode;
        cookie.set("ft-subs",this.state.subscriptions,{expires: 36500});
        this.setState(this.state);

        return true;
    }

    render() {
        return <Semantify.Grid>
                <LectureAdditionModal addSub={this.addSubscription.bind(this)} removeSub={this.removeSubscription.bind(this)} />
            <Semantify.Column className="nine wide">
                <h3>Updates</h3>
                <LectureSubscriptionUpdates subscriptions={this.state.subscriptions}></LectureSubscriptionUpdates>
            </Semantify.Column>
            <Semantify.Column className="seven wide">
                <LectureSubscriptions addSub={this.addSubscription.bind(this)} removeSub={this.removeSubscription.bind(this)} subscriptions={this.state.subscriptions}></LectureSubscriptions>
            </Semantify.Column>
        </Semantify.Grid>;
    }
}

class OptionsModal extends React.Component<{},{}> {
    constructor(props) {
        super(props);

        if(!cookie.get("ft-lecture-year")) {
            this.setYearInternal(2016);
        }
    }

    componentDidMount() {
        window["$"]("#optionsModal").modal();
        let list = require("../../topics").topicDatabase;

        window["$"]("#addYearSearchBox").search({
            source: [
                {
                    year: "2011"
                },
                {
                    year: "2012"
                },
                {
                    year: "2013"
                },
                {
                    year: "2014"
                },
                {
                    year: "2015"
                },
                {
                    year: "2016"
                }
            ],
            searchFields: [
                "year"
            ],
            cache: false,
            fields: {
                title: "year"
            }
        });
    }

    setYear() {
        let year = parseInt($("#yearSearchBox").val());
        $("#yearSearchBox").val("");

        this.setYearInternal(year);
    }

    setYearInternal(year:number) {
        if(year == year) {
            cookie.set("ft-lecture-year",year,{expires: 36500});
        }
    }

    render() {
        return <div className="ui modal" id="optionsModal">
            <i className="close icon"></i>
            <div className="header">Lecture Year Selector</div>
            <div className="content">
                <div className="description">
                    <div className="ui header">Type in a year</div>
                        <div className="ui search" id="addYearSearchBox">
                            <input className="prompt" id="yearSearchBox" placeholder="Available Years..." type="text" />
                            <div className="results"></div>
                        </div>
                    </div>
                </div>
                <div className="actions">
                    <div className="ui black deny button">Cancel</div>
                <div onClick={this.setYear.bind(this)} className="ui positive right labeled icon button">
                    Save
                    <i className="checkmark icon"></i>
                </div>
            </div>
        </div>
    }
}

export class Lectures extends Page {
    initialise() {}

    options() {
        window["$"]("#optionsModal").modal("show")
    }

    render(data) {
        yearOverride = querystring.parse(data.querystring).year;

        $("title").text("Lecture Viewer 2.0");

        ReactDOM.render(
            <Semantify.Container>
                <OptionsModal />
                <div className="ui right floated button" onClick={this.options}>Options</div>
                <h1>Lecture Viewer 2.0</h1>
                <LecturesApp></LecturesApp>
            </Semantify.Container>,
            $("#stage").get(0)
        )
    }
}
