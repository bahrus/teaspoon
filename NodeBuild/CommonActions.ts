//#region[mode='cs'] module tsp.Is {

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

    

    //#region Action Management
    export interface IActionList extends IAction {
        subActions: IAction[];
    }
    //#endregion

/*//#region[mode='cs'] 
}
*///#endregion[mode='cs']

