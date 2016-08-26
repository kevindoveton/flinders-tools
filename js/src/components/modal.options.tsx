/// <reference path="../../../typings/index.d.ts" />

import * as React from "react";

class InternalOptionsModal extends React.Component<{
    setYear: (year) => void
},{}> {
    componentDidMount() {
        window["$"]("#optionsModal").modal();
        let list = require("../lib/topics").topicDatabase;

        window["$"]("#addYearSearchBox").search({
            source: [
                {
                    year: "2011"
                },
                {
                    year: "2012"
                },
                {
                    year: "2013"
                },
                {
                    year: "2014"
                },
                {
                    year: "2015"
                },
                {
                    year: "2016"
                }
            ],
            searchFields: [
                "year"
            ],
            cache: false,
            fields: {
                title: "year"
            }
        });
    }

    setYear() {
        let year = parseInt($("#yearSearchBox").val());
        $("#yearSearchBox").val("");

        this.props.setYear(year);
    }

    render() {
        return <div className="ui modal" id="optionsModal">
            <i className="close icon"></i>
            <div className="header">Lecture Year Selector</div>
            <div className="content">
                <div className="description">
                    <div className="ui header">Type in a year</div>
                        <div className="ui search" id="addYearSearchBox">
                            <input className="prompt" id="yearSearchBox" placeholder="Available Years..." type="text" />
                            <div className="results"></div>
                        </div>
                    </div>
                </div>
                <div className="actions">
                    <div className="ui black deny button">Cancel</div>
                <div onClick={this.setYear.bind(this)} className="ui positive right labeled icon button">
                    Save
                    <i className="checkmark icon"></i>
                </div>
            </div>
        </div>
    }
}

import {setYear} from "../actions";

import {connect} from "react-redux";

import {IAppState} from "../reducers";

function mapStateToProps(state:IAppState) {
    return {

    }
}

function mapDispatchToProps(dispatch) {
    return {
        setYear: (year) => {
            dispatch(setYear(year));
        }
    }
}

export const OptionsModal = connect(
    mapStateToProps,
    mapDispatchToProps
)(InternalOptionsModal);
