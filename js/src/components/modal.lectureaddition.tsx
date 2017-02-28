/// <reference path="../../../typings/index.d.ts" />

import * as React from "react";
import {getTopics} from "../lib/topics";

export class LectureAdditionModal extends React.Component<{
    addSub:(topicCode:string)=>void,
    removeSub:(topicCode:string)=>void
},{}> {
    componentDidMount() {
        window["$"]("#addLectureModal").modal();
        let sourcelist = getTopics();

        let lookup = {};
        let list = [];
        for(let entry of sourcelist) {
            if(lookup[entry.code]) {
                continue;
            }
            list[list.length] = entry;
            lookup[entry.code] = true;
        }

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
                            <input className="prompt" id="topicSearchBox" placeholder={"All Topics..."} type="text" />
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
