/// <reference path="../../../typings/index.d.ts" />

import * as React from "react";

import {LectureSubscription} from "./view.row.subscription";
let Semantify = require("react-semantify");
import * as lectures from "../lib/lectures";

export class LectureSubscriptions extends React.Component<{
    subscriptions:string[],
    addSub:(topicCode:string)=>void,
    removeSub:(topicCode:string)=>void,
},{}> {
    constructor(props) {
        super(props);
    }

    addTopic() {
        window["$"]("#addLectureModal").modal("show");
    }

    render() {
        let subs = this.props.subscriptions.map((subjectCode,i) => {
            return <LectureSubscription addSub={this.props.addSub} removeSub={this.props.removeSub} key={i} code={subjectCode}></LectureSubscription>
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
