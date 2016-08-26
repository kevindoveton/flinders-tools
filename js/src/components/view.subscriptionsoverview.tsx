/// <reference path="../../../typings/index.d.ts" />

import * as React from "react";

import {ILectureList} from "../lib/lectures";
import {LectureAdditionModal} from "./modal.lectureaddition";
import {LectureSubscriptionUpdates} from "./view.updatesfeed";
import {LectureSubscriptions} from "./view.list.subscription";

let Semantify = require("react-semantify");

class InternalSubscriptionsOverview extends React.Component<{
    subscriptions:string[];
    addSubscription: (topiccode:string) => void;
    removeSubscription: (topiccode:string) => void;
    loading: boolean;
},{}> {
    render() {
        return <div className="ui grid">
                <LectureAdditionModal addSub={this.props.addSubscription} removeSub={this.props.removeSubscription} />
             <Semantify.Column className="nine wide">
                <h3>Unwatched lectures</h3>
                <LectureSubscriptionUpdates></LectureSubscriptionUpdates>
            </Semantify.Column>
            <Semantify.Column className="seven wide">
                <LectureSubscriptions
                    addSub={this.props.addSubscription}
                    removeSub={this.props.removeSubscription}
                    subscriptions={this.props.subscriptions}></LectureSubscriptions>
            </Semantify.Column>
        </div>;
    }
}

import {addSubscription,removeSubscription} from "../actions";

import {connect} from "react-redux";

import {IAppState} from "../reducers";

function mapStateToProps(state:IAppState) {
    return {
        subscriptions: state.subscriptions,
        loading: state.isLoading,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        addSubscription: (topiccode:string) => {
            dispatch(addSubscription(topiccode))
        },
        removeSubscription: (topiccode:string) => {
            dispatch(removeSubscription(topiccode))
        },
    }
}

export const SubscriptionsOverview = connect(
    mapStateToProps,
    mapDispatchToProps
)(InternalSubscriptionsOverview);

