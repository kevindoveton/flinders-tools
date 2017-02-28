/// <reference path="../../typings/index.d.ts" />

import * as $ from "jquery";
window["$"] = $;
window["jQuery"] = $;

require("../../semantic/semantic.min.js");

import {Main} from "./components/main";
import {SubscriptionList} from "./components/app.subscriptionsoverview";
import {TopicOverview} from "./components/app.topicoverview";
import {LectureVideo} from "./components/app.video";
import app from "./reducers";
import {requestSubscriptions} from "./actions";

import * as React from "react";
import * as ReactDOM from "react-dom";

import {createStore,applyMiddleware} from "redux";
import thunkMiddleware from "redux-thunk";
import * as createLogger from "redux-logger";
import {Router,Route} from "react-router";

import {Provider} from "react-redux";

let store = createStore(app,
    applyMiddleware(
        thunkMiddleware,
        createLogger()
    )
);

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <Route component={Main}>
                <Route path="/" component={SubscriptionList} />
                <Route path="/vid/:url" component={LectureVideo} />
                <Route path="/topic/:topicCode" component={TopicOverview} />
            </Route>
        </Router>
    </Provider>,
    document.getElementById("stage")
);

store.dispatch(requestSubscriptions());
