/*//#region[mode='cs'] 
module tsp.DOMActions{
    var Is = tsp.Is;
    var u = tsp.util;
*///#endregion[mode='cs']
//#region[mode='ss'] 
import ca = require('./CommonActions');
import pa = require('./ParserActions');
import fsa = require('./FileSystemActions');
//#endregion[mode='ss'] 

//#region DOM Actions




export interface IUglify {
    uglify(pathOfReferencingFile: string, relativeURL: string): string;
}


interface IDOMState extends fsa.IHTMLFileProcessorActionState {
}







export interface IHTMLFileBuildAction extends fsa.ISelectAndProcessFileAction {
    domTransformActions: IDOMTransformAction[];
}

    //#endregion
//#region Element Build Actions

interface IDOMElementBuildActionState extends IDOMState {
    element: JQuery;
    DOMTransform?: IDOMTransformAction;
}

export interface IDOMElementBuildAction extends fsa.IWebAction {
    state?: IDOMElementBuildActionState;
    //isDOMElementAction?: (action: IBuildAction) => boolean; 
}  
export function remove(action: IDOMElementBuildAction, context: fsa.IWebContext, callback: ca.ICallback ) {
    action.state.element.remove();
    ca.endAction(action, callback);
}

export function addToJSClob(action: IDOMElementBuildAction, context: fsa.IWebContext, callback: ca.ICallback) {
    const state = action.state;
    const src = action.state.element.attr('src');
    const referringDir = context.fileManager.resolve(state.filePath, '..', src);
    if (!context.JSOutputs) context.JSOutputs = {};
    const jsOutputs = context.JSOutputs;
    if (!jsOutputs[referringDir]) jsOutputs[state.filePath] = [];
    const minifiedVersionFilePath = pa.replaceEndWith(referringDir, '.js', '.min.js');
    const minifiedContent = context.fileManager.readTextFileSync(minifiedVersionFilePath);
    jsOutputs[state.filePath].push(minifiedContent);
    action.state.element.remove();
    ca.endAction(action, callback);
}

//#endregion

//#region DOM Element Css Selector
export interface IDOMElementCSSSelectorState extends IDOMState {
    relativeTo?: JQuery;
    elements?: JQuery;
    treeNode?: IDOMTransformAction;
}

export interface IDOMElementSelector extends fsa.IWebAction {
}

export interface IDOMElementCSSSelector extends IDOMElementSelector {
    cssSelector: string;
    state?: IDOMElementCSSSelectorState;
}

export function selectElements(action: IDOMElementCSSSelector, context: fsa.IWebContext, callback: ca.ICallback) {
    if (action.debug) debugger;
    const aS = action.state;
    if (aS.relativeTo) {
        aS.elements = aS.relativeTo.find(action.cssSelector);
    } else {
        aS.elements = aS.$(action.cssSelector);
    }
    ca.endAction(action, callback);
}
//#endregion

//#region DOM Transform

export interface IDOMTransformActionState extends IDOMState {
    parent?: IDOMTransformAction;
}

export interface IDOMTransformAction extends fsa.IWebAction {
    selector: IDOMElementCSSSelector;
    elementAction?: IDOMElementBuildAction;
    state?: IDOMTransformActionState;
}

export function DOMTransform(action: IDOMTransformAction, context: fsa.IWebContext, callback: ca.ICallback) {
    let elements: JQuery;
    let p: IDOMTransformAction;
    if (action.state) {
        p = action.state.parent;
    }
    const aSel = action.selector;
    if (!aSel.state) {
        aSel.state = {
            $: action.state.$,
            filePath: action.state.filePath,
        };
    }
    const aSelSt = aSel.state;
    aSelSt.treeNode = action;
    if (p && p.elementAction) {
        aSelSt.relativeTo = p.elementAction.state.element;
    }
    aSel.do(aSel, context);
    const eA = action.elementAction;
    if (eA) {
        //#region element Action
        eA.state = {
            element: null,
            DOMTransform: action,
            $: aSelSt.$,
            filePath: aSelSt.filePath,
        };
        if (eA.async) {
            let i = 0;
            var n = aSelSt.elements.length;
            const eACallback = (err) => {
                if (i < n) {
                    const $elem = aSelSt.$(aSelSt.elements[i]);
                    i++;
                    eA.state.element = $elem;
                    eA.do(eA, context, eACallback);
                } else {
                    ca.endAction(action, callback);
                }
            };
            eACallback(null);
        } else {
            const n = aSelSt.elements.length
            for (let i = 0; i < n; i++) {
                const $elem = aSelSt.$(aSelSt.elements[i]);
                eA.state.element = $elem;
                eA.do(eA, context);
            }
            ca.endAction(action, callback);
        }
        //#endregion
    } else {
        ca.endAction(action, callback);
    }
    
    
}

export type ISubmergeHTMLFileIntoDomTransformActionState = ca.ISubMergeAction<IDOMTransformAction, fsa.IHTMLFile, IDOMTransformActionState>;


export interface IMergeAndDoForEachHTMLFileAction<TContainer, TListItem> {
    forEach?: (container: TContainer) => TListItem[];
    submergeActionGenerator?: [(container: TContainer) => ISubmergeHTMLFileIntoDomTransformActionState];
}
//#endregion

/*//#region[mode='cs']
}
*///#endregion[mode='cs']

    