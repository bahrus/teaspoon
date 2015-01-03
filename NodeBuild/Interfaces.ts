//#region[mode='cs'] module tsp.Is {

    export interface IContext {
        stringCache: { [key: string]: string };
        //FileManager?: IFileManager;
    }

    

    export interface IActionState {
        //callback?: (err) => void;
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


    
    
    
    

    export interface IFileProcessorActionState extends IActionState {
        filePath: string;
    }

    


    export interface IHTMLFileProcessorActionState extends IFileProcessorActionState, IActionState {
        $: JQueryStatic
    }

    

/*//#region[mode='cs'] 
}
*///#endregion[mode='cs']

