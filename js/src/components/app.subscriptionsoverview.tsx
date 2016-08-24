/// <reference path="../../../typings/index.d.ts" />

import * as React from "react";

import {OptionsModal} from "./modal.options";
import {SubscriptionsOverview} from "./view.subscriptionsoverview";

export class SubscriptionList extends React.Component<{},{}> {
    initialise() {}

    options() {
        window["$"]("#optionsModal").modal("show");
    }

    render() {
        $("title").text("Lecture Viewer 3.0");

        return <div>
            <OptionsModal />
            <div className="ui right floated button" onClick={this.options}>Options</div>
            <SubscriptionsOverview />
        </div>;
    }
}
