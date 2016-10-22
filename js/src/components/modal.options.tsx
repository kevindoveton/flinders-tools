/// <reference path="../../../typings/index.d.ts" />

import * as React from "react";
import * as persist from "../lib/cookie-persist";

class InternalOptionsModal extends React.Component<{
    setYear: (year) => void
},{}> {
    componentDidMount() {
        window["$"]("#optionsModal").modal();
        let list = require("../lib/topics").topicDatabase;

        let years = [];

        for(let i=2011;i <= (new Date().getFullYear());i++) {
            years[years.length] = {
                year: i.toString()
            };
        }

        years[years.length] = {
            year: "Current Year"
        };

        window["$"]("#addYearSearchBox").search({
            source: years,
            searchFields: [
                "year"
            ],
            cache: false,
            fields: {
                title: "year"
            }
        });

        $("#yearSearchBox").val(persist.getYearInternal());
    }

    setYear() {
        let year = parseInt($("#yearSearchBox").val());
        $("#yearSearchBox").val("");

        this.props.setYear(year);
    }

    render() {
        return <div className="ui modal" id="optionsModal">
            <i className="close icon"></i>
            <div className="header">Misc. Options and Info</div>
            <div className="content">
                <div className="description">
                    <div className="ui header">Options</div>
                    <div className="ui inline fluid search" id="addYearSearchBox">
                        <label>Year the lecture viewer fetches videos from: </label>
                        <input className="prompt" id="yearSearchBox" placeholder="Available Years..." type="text" />
                        <div className="results"></div>
                    </div>
                    <br />
                    <div className="ui header">Disclaimer</div>
                    <h5 className="footer">for <a href="https://flinders.edu.au">flinders university</a> students only</h5>
                    <h5 className="footer">this page doesn't host any copyrighted content</h5>
                    <h5 className="footer">this page only retrieves content from official servers and displays them in a user friendly format</h5>
                    <h5 className="footer">this page nor its creator endorses the illegal distribution of copyrighted content</h5>
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
