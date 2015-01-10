//#region[mode='cs'] module tsp.Is {
    //  This file should not reference any libraries outside of the core Javascript and Lodash

import pa = require('./ParserActions');
import _ = require('lodash');

export interface IContext {
    stringCache: { [key: string]: string };
    processManager?: IProcessManager;
}

export interface IActionState {
}

export interface ICallback {
    (err) : void;
}

export interface IAction {
    do?: (action: IAction, context: IContext, callback?: ICallback) => void;
    state?: IActionState;
    debug?: boolean;
    log?: boolean;
    async?: boolean;
}

export function endAction(action: IAction, callback: ICallback) {
    if (callback) callback(null);
}


export interface IMessageState extends IActionState {
    dynamicMessage?: string;
}

export interface IMessageAction extends IAction {
    message?: string;
    messageGenerator?: (IMessageAction) => string;
    state?: IMessageState;
}

export function logToConsole(messageAction: IMessageAction, context: IContext, callback: ICallback) {
    var mA = messageAction;
    mA.state = {
        dynamicMessage: mA.message ? mA.message : '',
    };
    var mS = mA.state;
    if (mA.messageGenerator) {
        var genMessage = mA.messageGenerator(mA);
        genMessage = (mS.dynamicMessage ? (mS.dynamicMessage + ' ') : '') + genMessage;
        mS.dynamicMessage = genMessage;
    }
    console.log(mS.dynamicMessage);
}

//#region Action Management
export interface IActionList extends IAction {
    subActions?: IAction[];
}

export function doSequenceOfActions(action: IActionList, context: IContext, callback: ICallback) {
    if (action.async) {
        var i = 0, n = action.subActions.length;
        var seqCallback: ICallback = (err) => {
            if (i < n) {
                var subAction = action.subActions[i];
                i++;
                subAction.do(subAction, context, seqCallback);
            } else {
                endAction(action, callback);
            }
        };
        seqCallback(null);
    } else {
        for (var i = 0, n = action.subActions.length; i < n; i++) {
            var subAction = action.subActions[i];
            subAction.do(subAction, context);
        }
        endAction(action, callback);
    }
}
export interface ITypedActionList<T> extends IAction {
    configOneLiners?: [(t: T) => void];
    subActionsGenerator?: [(t: T) => IAction];
}

export function doSequenceOfTypedActions<T>(action: ITypedActionList<T>, context: IContext, callback: ICallback) {
    //doSequenceOfActions(action.subActionsGenerator(action), context, callback);
    var t = <T> <any> action;
    var actionList: IActionList = {
        do: doSequenceOfActions,
        subActions: _.map(action.subActionsGenerator, sag => sag(t)),
        async: action.async,
    };
    //var subActions = [];
    //for (var i = 0, n = action.subActionsGenerator.length; i < n; i++) {
    //    var sag = action.subActionsGenerator[i];
    //    var subAction = sag(t);
    //    subActions.push(subAction);
    //}
    //actionList.subActions = subActions;
    //debugger;
    if (action.async) {
        var myCallback: ICallback = err => {
            endAction(action, callback);
        };
        doSequenceOfActions(actionList, context, myCallback);
    } else {
        doSequenceOfActions(actionList, context, callback);
        endAction(action, callback);
    }
    
}

export interface IMergeAction<T> extends IAction {
    srcRefs: T[];
    destRef: T;
}

export function merge<T>(mergeAction: IMergeAction<T>, context: IContext, callback: ICallback) {
    for (var i = 0, n = mergeAction.srcRefs.length; i < n; i++) {
        var srcRef = mergeAction.srcRefs[i];
        _.merge(srcRef, mergeAction.destRef);
    }
}
//#endregion

export interface IProcessManager {
    WaitForUserInputAndExit (message: string, testForExit: (chunk: string, key: any) => boolean);
}


/*//#region[mode='cs'] 
}
*///#endregion[mode='cs']

