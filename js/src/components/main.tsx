/// <reference path="../../../typings/index.d.ts" />

import * as React from "react";

import {version} from "../lib/cookie-persist";

export class MainInternal extends React.Component<{ year }, {}> {
    componentDidMount() {
        window["$"]("#main-title").popup();
    }

    componentDidUpdate() {
        window["$"]("#main-title").popup();
    }

    render() {
        let style = {
            "padding-top": "20px"
        };

        $("title").text("Lecture Viewer " + version);

        return <div>
            <div className="ui container" style={style}>
                <h1 id="main-title" data-content={`currently browsing  ${this.props.year} lectures`}>Magical Lecture Viewer 🎊</h1>
                {this.props.children}
                <h5 className="footer">coded with ❤ by <a href="https://github.com/swadicalrag/">swadical</a></h5>
            </div>
        </div>
    }
}

import {connect} from "react-redux";

import {IAppState} from "../reducers";

function mapStateToProps(state: IAppState) {
    return {
        year: state.year
    }
}

function mapDispatchToProps(dispatch) {
    return {

    }
}

export let Main = connect(
    mapStateToProps,
    mapDispatchToProps
)(MainInternal);

