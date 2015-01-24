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

}

if (typeof (global) !== 'undefined') {
    var guid = 'tsp-81B44259-976C-4DFC-BE00-6E901415FEF3';
    var globalNS = global[guid] || 'tsp';
    if (!global[globalNS]) global[globalNS] = {};
    global[globalNS].CommonActions = tsp.CommonActions;
}
