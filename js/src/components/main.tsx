/// <reference path="../../../typings/index.d.ts" />

import * as React from "react";

export default class Main extends React.Component<{},{}> {
    render() {
        let style = {
            "padding-top": "20px"
        };

        return <div>
            <div className="ui container" style={style}>
                <h1>Magical Lecture Viewer 🎊</h1>
                {this.props.children}
                <h5 className="footer">coded with ❤ by <a href="https://github.com/swadicalrag/">swadical</a></h5>
            </div>
        </div>
    }
}
