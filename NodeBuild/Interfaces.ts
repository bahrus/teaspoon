//#region[mode='cs'] module tsp.Is {

    export interface IContext {
        stringCache: { [key: string]: string };
        FileManager?: IFileManager;
    }

    export interface IWebContext extends IContext {
        HTMLOutputs: { [key: string]: JQueryStatic };
        JSOutputs?: { [key: string]: string[] };
        FileManager: IWebFileManager;
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

    export interface IWebAction extends IAction {
        do: (action: IWebAction, context: IWebContext, callback?: ICallback) => void;
        
    }

    //#region Action Management
    export interface IActionList extends IAction {
        subActions: IAction[];
    }
    //#endregion

    //#region FileActions

    export interface IFileProcessorActionState extends IActionState {
        filePath: string;
    }

    export interface IFileProcessorAction extends IWebAction {
        state?: IFileProcessorActionState;
        fileSubProcessActions?: IWebAction[];
        

    }


    export interface IFileSelectorActionState {
        rootDirectory: string;
        selectedFilePaths?: string[];
    }

    export interface IRootDirectoryRetriever {
        rootDirectoryRetriever?: (context: IWebContext) => string;
    }

    export interface IFileSelectorAction extends IWebAction, IRootDirectoryRetriever {
        
        //fileName?: string;
        fileTest?: (s: string) => boolean;
        recursive?: boolean;
        state?: IFileSelectorActionState;
    }
    
    interface IFileReaderActionState extends IActionState{
        content?: string;
    }

    export interface ITextFileReaderAction extends IAction, IRootDirectoryRetriever {
        relativeFilePath: string;
        state?: IFileReaderActionState;
    }

    export interface ICacheFileContents extends IAction {
        cacheKey: string;
        fileReaderAction: ITextFileReaderAction;
    }

    export interface IWaitForUserInput extends IAction {
    }

    export interface ISelectAndProcessFileAction extends IWebAction {
        fileSelector: IFileSelectorAction
        fileProcessor: IFileProcessorAction;
        
    }


    //#endregion

    
    export interface IFileManager {
        resolve(...pathSegments: any[]): string;
        getSeparator(): string;
        readTextFileSync(filePath: string): string;
        readTextFileAsync(filePath: string, callback: (err: Error, data: string) => void);
        listDirectorySync(dirPath: string): string[];
        getExecutingScriptFilePath: () => void;
        writeTextFileSync(filePath: string, content: string) : void;
    }
    
    export interface IWebFileManager extends IFileManager{
        
        loadHTML: (html: string) => JQueryStatic
        minify: (filePath: string, callback: (err: Error, min: string) => void) => void;
    }

    export interface IHTMLFileProcessorActionState extends IFileProcessorActionState, IActionState {
        $: JQueryStatic
    }

    export interface IExportDocumentsToFiles extends IWebAction {
        outputRootDirectoryPath?: string;

    }

/*//#region[mode='cs'] 
}
*///#endregion[mode='cs']

