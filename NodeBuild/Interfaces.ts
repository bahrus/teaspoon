export module tsp {
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

    export interface IBuildConfig{
        buildActions: IBuildAction[];
    }

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
        domTransformActions: IDOMTransformTreeNodeBuildAction[];
    }

    interface IDOMElementBuildActionState extends IDOMState {
        element: JQuery;
        treeNode?: IDOMTransformTreeNodeBuildAction;
    }

    export interface IDOMElementBuildAction extends IBuildAction{
        state?: IDOMElementBuildActionState;
        //isDOMElementAction?: (action: IBuildAction) => boolean; 
    }
    
    export interface IDOMElementSelector extends IBuildAction{
        //isDOMElementSelector?: (action: IBuildAction) => boolean;
    }

    interface IDOMState {
        $: JQueryStatic;
    }

    interface IDOMElementCSSSelectorState extends IDOMState {
        relativeTo?: JQuery;
        elements?: JQuery;
        treeNode?: IDOMTransformTreeNodeBuildAction;
    }

    export interface IDOMElementCSSSelector extends IDOMElementSelector{
        cssSelector: string;
        state?: IDOMElementCSSSelectorState;
    }

    interface IDOMTransformTreeNodeBuildActionState extends IDOMState {
        parent?: IDOMTransformTreeNodeBuildAction;
    }

    export interface IDOMTransformTreeNodeBuildAction extends IBuildAction{
        selector: IDOMElementCSSSelector;
        elementAction?: IDOMElementBuildAction;
        //parent?: IDOMTransformTree
        children?: IDOMTransformTreeNodeBuildAction[];
        state?: IDOMTransformTreeNodeBuildActionState;
    }


}