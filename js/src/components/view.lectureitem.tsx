import * as React from "react";

import {Link} from "react-router";
import {ILecture,ILectureList} from "../lib/lectures";
let LZString = require("lz-string");
import * as b64 from "js-base64";

let Semantify = require("react-semantify");

export class InternalLectureItem extends React.Component<{
    title:string,
    date:string,
    url:string,
    watchLecture:(url:string)=>void,
    unwatchLecture:(url:string)=>void,
    isWatched: boolean;
},{}> {
    render() {
        let watched:any = "";

        // let url = LZString.compress(this.props.url);
        let url = (this.props.url);
        let target = "/vid/" + b64.Base64.encodeURI(url);

        if(this.props.isWatched) {
            watched = <div className="ui horizontal label">Watched<i onClick={() => this.props.unwatchLecture(url)} className="delete icon"></i></div>;
        }

        return <div className="item">
            <div className="content">
                <Link onClick={() => this.props.watchLecture(url)} className="header" to={target}>
                    {this.props.title}
                </Link>
                <div className="description">{this.props.date} ago {watched}</div>
            </div>
        </div>
    }
}

import {connect} from "react-redux";
import {watchLecture,unwatchLecture} from "../actions";

function mapStateToProps(state) {
    return {

    }
}

function mapDispatchToProps(dispatch) {
    return {
        watchLecture: (url:string) => {
            dispatch(watchLecture(url));
        },
        unwatchLecture: (url:string) => {
            dispatch(unwatchLecture(url));
        }
    }
}

export const LectureItem = connect(
    mapStateToProps,
    mapDispatchToProps
)(InternalLectureItem);
