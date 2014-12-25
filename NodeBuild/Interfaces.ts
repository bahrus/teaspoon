export module tsp {
    export interface IBuildContext {
        $: JQueryStatic;
        //currentElement?: JQuery;
        outputs?: {[key: string] : JQueryStatic};
    }

    export interface IBuildAction {
        do: (action: IBuildAction, context: IBuildContext) => void;
        
    }

    export interface IBuildConfig{
        buildActions: IBuildAction[];
    }

    interface IDOMElementBuildActionState {
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

    interface IDOMElementCSSSelectorState {
        relativeTo?: JQuery;
        elements?: JQuery;
        treeNode?: IDOMTransformTreeNodeBuildAction;

    }

    export interface IDOMElementCSSSelector extends IDOMElementSelector{
        cssSelector: string;
        state?: IDOMElementCSSSelectorState;
    }

    interface IDOMTransformTreeNodeBuildActionState {
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