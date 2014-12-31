//#region[mode='cs'] module tsp.Is {

    export interface IContext {
        stringCache: { [key: string]: string };
        FileManager?: IFileManager;
    }

    export interface IWebContext extends IContext {
        HTMLOutputs: { [key: string]: JQueryStatic };
        JSOutputs?: { [key: string]: string };
        FileManager: IWebFileManager;
    }

    interface IActionState {
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

    interface IFileProcessorActionState extends IActionState {
        filePath: string;
    }

    export interface IFileProcessorAction extends IWebAction {
        state?: IFileProcessorActionState;
        fileSubProcessActions?: IWebAction[];
        

    }

    interface IHTMLFileProcessorActionState extends IFileProcessorActionState, IActionState {
        $:  JQueryStatic
    }

    export interface IHTMLFileProcessorAction extends IFileProcessorAction {
        state?: IHTMLFileProcessorActionState;
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

    export interface IFileBuildAction extends IWebAction {
        fileSelector: IFileSelectorAction
        fileProcessor: IFileProcessorAction;
        
    }

    export interface IHTMLFileBuildAction extends IFileBuildAction {
        domTransformActions: IDOMTransformAction[];
    }

    //#endregion

    //#region DOM Actions
    interface IDOMElementBuildActionState extends IDOMState {
        element: JQuery;
        DOMTransform?: IDOMTransformAction;
    }

    export interface IDOMElementBuildAction extends IWebAction{
        state?: IDOMElementBuildActionState;
        //isDOMElementAction?: (action: IBuildAction) => boolean; 
    }
    
    export interface IDOMElementSelector extends IWebAction{
        //isDOMElementSelector?: (action: IBuildAction) => boolean;
    }

    export interface IUglify {
        uglify(pathOfReferencingFile: string, relativeURL: string): string;
    }

    export interface IDOMElementCSSSelectorState extends IDOMState {
        relativeTo?: JQuery;
        elements?: JQuery;
        treeNode?: IDOMTransformAction;
    }

    export interface IDOMElementCSSSelector extends IDOMElementSelector {
        cssSelector: string;
        state?: IDOMElementCSSSelectorState;
    }

    interface IDOMState extends IHTMLFileProcessorActionState {
    }

    interface IDOMTransformActionState extends IDOMState {
        parent?: IDOMTransformAction;
    }

    export interface IDOMTransformAction extends IWebAction {
        selector: IDOMElementCSSSelector;
        elementAction?: IDOMElementBuildAction;
        //parent?: IDOMTransformTree
        //children?: IDOMTransformAction[];
        state?: IDOMTransformActionState;
    }

    //#endregion
    export interface IFileManager {
        resolve(...pathSegments: any[]): string;
        getSeparator(): string;
        readTextFileSync(filePath: string): string;
        readTextFileAsync(filePath: string, callback: (err: Error, data: string) => void);
        listDirectorySync(dirPath: string): string[];
        getExecutingScriptFilePath: () => void;
    }
    
    export interface IWebFileManager extends IFileManager{
        
        loadHTML: (html: string) => JQueryStatic
        minify: (filePath: string, callback: (err: Error, min: string) => void) => void;
    }
    

/*//#region[mode='cs'] 
}
*///#endregion[mode='cs']

