//#region[mode='cs'] module tsp.Is {
    import u = require('./tspUtil');
    //  This file should not reference any libraries outside of the core Javascript

    export interface IContext {
        stringCache: { [key: string]: string };
    }

    export interface IActionState {
    }

    export interface ICallback {
        (err) : void;
    }

    export interface IAction {
        do: (action: IAction, context: IContext, callback?: ICallback) => void;
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
        subActions: IAction[];
    }
    //#endregion

/*//#region[mode='cs'] 
}
*///#endregion[mode='cs']

