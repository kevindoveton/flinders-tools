/// <reference path="../../typings/index.d.ts" />

import {EAppEvent} from './actions'
import * as update from "react-addons-update";

export interface IAppState {
    
}

const initialState:IAppState = {
    
}

export default function app(state:IAppState = initialState,action) {
    switch(action.type) {
        default: {
            return state;
        }
    }
}
