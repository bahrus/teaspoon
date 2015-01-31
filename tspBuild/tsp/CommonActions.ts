if (typeof (global) !== 'undefined') {
    require('./Refs');
}
module tsp.CommonActions {
    export var versionKey = 'version';

    export interface IProcessManager {
        WaitForUserInputAndExit(message: string, testForExit: (chunk: string, key: any) => boolean);
    }


    export interface IContext {
        stringCache: { [key: string]: string };
        processManager?: IProcessManager;
    }

    export interface IActionState {
    }

    export interface ICallback {
        (err): void;
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

    //#region Message Action
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

    //#endregion

    //#region Action Management
    export interface IActionList extends IAction {
        subActions?: IAction[];
    }

    export function doSequenceOfActions(action: IActionList, context: IContext, callback: ICallback) {
        if (action.async) {
            var i = 0;
            var n = action.subActions.length;
            var seqCallback: ICallback = (err) => {
                if (i < n) {
                    var subAction = action.subActions[i];
                    i++;
                    if (!subAction) {
                        console.log(i + 'th action is null');
                    }
                    if (!subAction.do) {
                        console.log(i + 'th action has no do method');
                    }
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
        var t = <T> <any> action;
        var actionList: IActionList = {
            do: doSequenceOfActions,
            subActions: _.map(action.subActionsGenerator, sag => sag(t)),
            async: action.async,
        };
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
        var n = mergeAction.srcRefs.length;
        for (var i = 0; i < n; i++) {
            var srcRef = mergeAction.srcRefs[i];
            _.merge(srcRef, mergeAction.destRef);
        }
    }

    export interface ISubMergeAction<TDestAction extends IAction, TSrc, TProp> {
        srcRefs: TSrc[];
        destRefs: TDestAction[];
        destinationPropertyGetter?: (destAction: TDestAction) => TProp;
        sourcePropertyGetter?: (src: TSrc) => TProp;
    }

    export function subMerge<TDestAction extends IAction, TSrc, TProp>(subMergeAction: ISubMergeAction<TDestAction, TSrc, TProp>, context: IContext, callback: ICallback) {
        var dpg = subMergeAction.destinationPropertyGetter;
        var spg = subMergeAction.sourcePropertyGetter;
        var srcRefs = subMergeAction.srcRefs;
        if (!srcRefs) {
            endAction(subMergeAction, callback);
            return;
        }
        var noOfSrcRefs = srcRefs.length;
        var destRefs = subMergeAction.destRefs;
        var noOfDestRefs = destRefs.length;
        //var destProp = dpg(dr);
        for (var i = 0; i < noOfSrcRefs; i++) {
            var srcRef = srcRefs[i];
            var srcProp = spg(srcRef);
            for (var j = 0; j < noOfDestRefs; j++) {
                var destRef = destRefs[j];
                var destProp = dpg(destRef);
                _.merge(srcProp, destProp);
                destRef.do(destRef, context, callback);
            }

        }
    }

    export interface IDoForEachAction<TContainer, TListItem> extends IAction {
        forEach?: (container: TContainer) => TListItem[];
        subActionsGenerator?: (container: TContainer) => [(listItem: TListItem) => IAction];
    }



//export function 
//#endregion
}

if (typeof (global) !== 'undefined') {
    var guid = 'tsp-81B44259-976C-4DFC-BE00-6E901415FEF3';
    var globalNS = global[guid] || 'tsp';
    if (!global[globalNS]) global[globalNS] = {};
    global[globalNS].CommonActions = tsp.CommonActions;
}
