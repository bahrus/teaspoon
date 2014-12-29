//module tsp {
    export interface IBuildContext {
        //$: JQueryStatic;
        //currentElement?: JQuery;
        //rootDirectory?: string;
        HTMLOutputs?: { [key: string]: JQueryStatic };
        JSOutputs?: { [key: string]: string };
        WebFileManager: IWebFileManager;
    }

    export interface IBuildAction {
        do: (action: IBuildAction, context: IBuildContext) => void;
        sync?: boolean;
        debug?: boolean;
        log?: boolean;
        state?: IActionState;
    }

    //export interface IBuildConfig{
    //    buildActions: IBuildAction[];
    //}

    interface IFileProcessorActionState extends IActionState {
        filePath: string;
    }

    export interface IFileProcessorAction extends IBuildAction {
        state?: IFileProcessorActionState;
        fileSubProcessActions?: IBuildAction[];
        

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

    export interface IFileSelectorAction extends IBuildAction {
        rootDirectoryRetriever?: (context: IBuildContext) => string;
        fileTest?: (s: string) => boolean;
        recursive?: boolean;
        state?: IFileSelectorActionState;
    }

    export interface IFileBuildAction extends IBuildAction {
        fileSelector: IFileSelectorAction
        fileProcessor: IFileProcessorAction;
        
    }

    export interface IHTMLFileBuildAction extends IFileBuildAction {
        domTransformActions: IDOMTransformAction[];
    }

    interface IDOMElementBuildActionState extends IDOMState {
        element: JQuery;
        DOMTransform?: IDOMTransformAction;
    }

    export interface IDOMElementBuildAction extends IBuildAction{
        state?: IDOMElementBuildActionState;
        //isDOMElementAction?: (action: IBuildAction) => boolean; 
    }
    
    export interface IDOMElementSelector extends IBuildAction{
        //isDOMElementSelector?: (action: IBuildAction) => boolean;
    }

    interface IActionState {
        callback?: (err) => void;
    }

    interface IDOMState extends IHTMLFileProcessorActionState{
    }

    export interface IUglify {
        uglify(pathOfReferencingFile: string, relativeURL: string): string;
    }

    export interface IDOMElementCSSSelectorState extends IDOMState {
        relativeTo?: JQuery;
        elements?: JQuery;
        treeNode?: IDOMTransformAction;
    }

    export interface IDOMElementCSSSelector extends IDOMElementSelector{
        cssSelector: string;
        state?: IDOMElementCSSSelectorState;
    }

    interface IDOMTransformActionState extends IDOMState {
        parent?: IDOMTransformAction;
    }

    export interface IDOMTransformAction extends IBuildAction{
        selector: IDOMElementCSSSelector;
        elementAction?: IDOMElementBuildAction;
        //parent?: IDOMTransformTree
        //children?: IDOMTransformAction[];
        state?: IDOMTransformActionState;
    }

    export interface IWebFileManager {
        resolve(...pathSegments: any[]): string;
        getSeparator(): string;
        readTextFileSync(filePath: string): string;
        readTextFileAsync(filePath: string, callback:  (err: Error, data: string) => void);
        listDirectorySync(dirPath: string): string[];
        loadHTML: (html: string) => JQueryStatic
        minify: (filePath: string, callback: (err: Error, min: string) => void) => void;
        getExecutingScriptFilePath: () => void;
    }
    

//}

