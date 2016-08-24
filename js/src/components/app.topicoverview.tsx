/// <reference path="../../../typings/index.d.ts" />

import * as React from "react";
import * as router from 'react-router';

let Semantify = require("react-semantify");

import {LectureList} from "./view.lecturelist";

export class TopicOverview extends React.Component<{
    params: any
},{}> {
    initialise() {}

    options() {
        window["$"]("#optionsModal").modal("show");
    }

    render() {
        return <Semantify.Container>
            <div className="ui right floated button" onClick={router.hashHistory.goBack}>Back</div>
            <h2>{this.props.params.topicCode}</h2>
            <LectureList topicCode={this.props.params.topicCode} />
        </Semantify.Container>;
    }
}
