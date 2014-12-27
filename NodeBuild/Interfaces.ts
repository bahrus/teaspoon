//module tsp {
    export interface IBuildContext {
        //$: JQueryStatic;
        //currentElement?: JQuery;
        //rootDirectory?: string;
        HTMLOutputs?: { [key: string]: JQueryStatic };
        JSOutputs?: { [key: string]: string };
        
    }

    export interface IBuildAction {
        do: (action: IBuildAction, context: IBuildContext) => void;
        debug?: boolean;
        log?: boolean;
    }

    //export interface IBuildConfig{
    //    buildActions: IBuildAction[];
    //}

    interface IFileProcessorActionState {
        filePath: string;
    }

    export interface IFileProcessorAction extends IBuildAction {
        state?: IFileProcessorActionState;
        fileSubProcessActions?: IBuildAction[];
    }

    interface IHTMLFileProcessorActionState extends IFileProcessorActionState {
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
        rootDirectoryRetriever?: () => string;
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

    interface IDOMState extends IHTMLFileProcessorActionState{
    }

    export interface IUglify {
        uglify(pathOfReferencingFile: string, relativeURL: string): string;
    }

    interface IDOMElementCSSSelectorState extends IDOMState {
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
        children?: IDOMTransformAction[];
        state?: IDOMTransformActionState;
    }


//}

