import * as topicList from "./topics.base"

import {getPromise} from "./request";

import {getYear} from "./cookie-persist";

let _topicListInternal:any[] = topicList.topicDatabase;

export function getTopics() {
    return _topicListInternal;
}

export function fetchTopics(year:number) {
    getPromise(`http://api.unibuddy.com.au/api/v2/uni/flinders/topics.json?&inst_code=flinders&year=${year}&semester=NS1,S1`)
        .then((resp) => {
            if((resp.code == 200) || (resp.code == 304)) {
                let topics = JSON.parse(resp.contents);

                _topicListInternal = topics.data;
            }
            else {
                throw new Error(`http code ${resp.code} != 200!`);
            }
        })
        .catch(() => {
            console.log(`Couldn't update topic list for ${year}`);
        })
}

fetchTopics(getYear());
