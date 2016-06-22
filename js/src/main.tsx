/// <reference path="../../typings/tsd.d.ts" />

import * as $ from "jquery";
window["$"] = $;
window["jQuery"] = $;

require("../../semantic/semantic.min.js")

let page = require("page");

let plyr = require("plyr");
plyr.setup();

import {Index} from "./routes/index";
import {Lectures} from "./routes/lectures";
import {LectureSubject} from "./routes/lectures/subject";

let index = new Index("/",page);
let lectures = new Lectures("/lectures",page);
let lectureSubject = new LectureSubject("/lectures/:topicCode",page);

$(document).ready(() => {
    page({
        hashbang: true
    });
})
