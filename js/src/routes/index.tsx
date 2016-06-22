import {Page} from "./base";

import * as $ from "jquery";
import * as React from "react";
import * as ReactDOM from "react-dom";

export class Index extends Page {
    initialise() {}

    render(data) {
        this.page.redirect("/lectures");

        let style = {
            textAlign: "center"
        }

        ReactDOM.render(
            <div className="pusher">
                <div className="ui container">
                    <div className="ui text container" style={style}>
                        <h1 className="ui huge header">
                            Flinders University Tools
                        </h1>
                    </div>
                </div>
            </div>,
            $("#stage").get(0)
        )
    }
}
