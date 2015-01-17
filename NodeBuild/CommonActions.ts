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
    const mA = messageAction;
    mA.state = {
        dynamicMessage: mA.message ? mA.message : '',
    };
    const mS = mA.state;
    if (mA.messageGenerator) {
        let genMessage = mA.messageGenerator(mA);
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
        let i = 0;
        const n = action.subActions.length;
        const seqCallback: ICallback = (err) => {
            if (i < n) {
                const subAction = action.subActions[i];
                i++;
                subAction.do(subAction, context, seqCallback);
            } else {
                endAction(action, callback);
            }
        };
        seqCallback(null);
    } else {
        for (let i = 0, n = action.subActions.length; i < n; i++) {
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
    const t = <T> <any> action;
    const actionList: IActionList = {
        do: doSequenceOfActions,
        subActions: _.map(action.subActionsGenerator, sag => sag(t)),
        async: action.async,
    };
    if (action.async) {
        const myCallback: ICallback = err => {
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
    const n = mergeAction.srcRefs.length;
    for (let i = 0; i < n; i++) {
        const srcRef = mergeAction.srcRefs[i];
        _.merge(srcRef, mergeAction.destRef);
    }
}

export interface ISubMergeAction<TDestAction extends IAction, TSrc, TProp>  {
    srcRefs?: TSrc[];
    destRefs?: TDestAction[];
    destinationPropertyGetter?: (destAction: TDestAction) => TProp;
    sourcePropertyGetter?: (src: TSrc) => TProp;
}

export function subMerge<TDestAction extends IAction, TSrc, TProp>(subMergeAction: ISubMergeAction<TDestAction, TSrc, TProp>, context: IContext, callback: ICallback) {
    const dpg = subMergeAction.destinationPropertyGetter;
    const spg = subMergeAction.sourcePropertyGetter;
    const srcRefs = subMergeAction.srcRefs;
    const noOfSrcRefs = srcRefs.length;
    const destRefs = subMergeAction.destRefs;
    const noOfDestRefs = destRefs.length;
    //const destProp = dpg(dr);
    for (let i = 0; i < noOfSrcRefs; i++) {
        const srcRef = srcRefs[i];
        const srcProp = spg(srcRef);
        for (let j = 0; j < noOfDestRefs; j++) {
            const destRef = destRefs[j];
            const destProp = dpg(destRef);
            _.merge(srcProp, destProp);
            destRef.do(destRef, context, callback);
        }
        
    }
}

export interface IDoForEachAction<TContainer, TListItem> extends IAction  {
    forEach?: (container: TContainer) => TListItem[];
    subActionsGenerator?: (container: TContainer) => [(listItem: TListItem) => IAction];
}



//export function 
//#endregion

export interface IProcessManager {
    WaitForUserInputAndExit (message: string, testForExit: (chunk: string, key: any) => boolean);
}


/*//#region[mode='cs'] 
}
*///#endregion[mode='cs']

