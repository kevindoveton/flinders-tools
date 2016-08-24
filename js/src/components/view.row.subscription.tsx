/// <reference path="../../../typings/index.d.ts" />

import * as React from "react";
import {Link} from "react-router";
let Semantify = require("react-semantify");
import * as lectures from "../lib/lectures";

export class LectureSubscription extends React.Component<{
    code:string,
    addSub:(topicCode:string)=>void,
    removeSub:(topicCode:string)=>void
},{}> {
    unsubscribe() {
        this.props.removeSub(this.props.code);
    }

    render() {
        let redirectURL = "/topic/" + this.props.code;
        return <Semantify.Item>
            <Semantify.Content className="right floated">
                <Link to={redirectURL}>
                    <Semantify.Button className="blue">
                        Watch
                    </Semantify.Button>
                </Link>
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
