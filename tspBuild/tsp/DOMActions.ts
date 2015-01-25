if (typeof (global) !== 'undefined') {
    require('./Refs');
}


module tsp.DOMActions {
    var fsa = FileSystemActions;
    var ca = CommonActions;
    var pa = ParserActions;

    //#region DOM Actions
    export interface IUglify {
        uglify(pathOfReferencingFile: string, relativeURL: string): string;
    }

    interface IDOMState extends FileSystemActions.IHTMLFileProcessorActionState {
    }

    export interface IHTMLFileBuildAction extends FileSystemActions.ISelectAndProcessFileAction {
        domTransformActions: IDOMTransformAction[];
    }

    //#endregion
    //#region Element Build Actions

    interface IDOMElementBuildActionState extends IDOMState {
        element: JQuery;
        DOMTransform?: IDOMTransformAction;
    }

    export interface IDOMElementBuildAction extends FileSystemActions.IWebAction {
        state?: IDOMElementBuildActionState;
        //isDOMElementAction?: (action: IBuildAction) => boolean; 
    }
    export function remove(action: IDOMElementBuildAction, context: FileSystemActions.IWebContext, callback: CommonActions.ICallback) {
        action.state.element.remove();
        ca.endAction(action, callback);
    }

    export function addToJSClob(action: IDOMElementBuildAction, context: FileSystemActions.IWebContext, callback: CommonActions.ICallback) {
        var state = action.state;
        var src = action.state.element.attr('src');
        var referringDir = context.fileManager.resolve(state.filePath, '..', src);
        if (!context.JSOutputs) context.JSOutputs = {};
        var jsOutputs = context.JSOutputs;
        if (!jsOutputs[referringDir]) jsOutputs[state.filePath] = [];
        var minifiedVersionFilePath = pa.replaceEndWith(referringDir, '.js', '.min.js');
        var minifiedContent = context.fileManager.readTextFileSync(minifiedVersionFilePath);
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

    export interface IDOMElementSelector extends FileSystemActions.IWebAction {
    }

    export interface IDOMElementCSSSelector extends IDOMElementSelector {
        cssSelector: string;
        state?: IDOMElementCSSSelectorState;
    }

    export function selectElements(action: IDOMElementCSSSelector, context: FileSystemActions.IWebContext, callback: CommonActions.ICallback) {
        if (action.debug) debugger;
        var aS = action.state;
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

    export interface IDOMTransformAction extends FileSystemActions.IWebAction {
        selector: IDOMElementCSSSelector;
        elementAction?: IDOMElementBuildAction;
        state?: IDOMTransformActionState;
    }

    export function DOMTransform(action: IDOMTransformAction, context: FileSystemActions.IWebContext, callback: CommonActions.ICallback) {
        var elements: JQuery;
        var p: IDOMTransformAction;
        if (action.state) {
            p = action.state.parent;
        }
        var aSel = action.selector;
        if (!aSel.state) {
            aSel.state = {
                $: action.state.$,
                filePath: action.state.filePath,
            };
        }
        var aSelSt = aSel.state;
        aSelSt.treeNode = action;
        if (p && p.elementAction) {
            aSelSt.relativeTo = p.elementAction.state.element;
        }
        aSel.do(aSel, context);
        var eA = action.elementAction;
        if (eA) {
            //#region element Action
            eA.state = {
                element: null,
                DOMTransform: action,
                $: aSelSt.$,
                filePath: aSelSt.filePath,
            };
            if (eA.async) {
                var i = 0;
                var n = aSelSt.elements.length;
                var eACallback = (err) => {
                    if (i < n) {
                        var $elem = aSelSt.$(aSelSt.elements[i]);
                        i++;
                        eA.state.element = $elem;
                        eA.do(eA, context, eACallback);
                    } else {
                        ca.endAction(action, callback);
                    }
                };
                eACallback(null);
            } else {
                var n = aSelSt.elements.length
                for (var i = 0; i < n; i++) {
                    var $elem = aSelSt.$(aSelSt.elements[i]);
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

    type ISubMergeHTMLFileIntoDomTransform = CommonActions.ISubMergeAction<IDOMTransformAction, FileSystemActions.IHTMLFile, IDOMTransformActionState>;

    export interface IPutHTMLFileIntoDomTransformAction extends CommonActions.IAction {
        htmlFiles: FileSystemActions.IHTMLFile[];
        domTransforms: IDOMTransformAction[];
    }

    export interface IDOMTransformForEachHTMLFileAction<TContainer, TListItem> {
        putHTMLFileIntoDomTransformGenerator?: (container: TContainer) => IPutHTMLFileIntoDomTransformAction;
    }

    export function ApplyDOMTransformsOnHTMLFiles(action: IPutHTMLFileIntoDomTransformAction, context: CommonActions.IContext, callback: CommonActions.ICallback) {
        var sma: ISubMergeHTMLFileIntoDomTransform = {
            srcRefs: action.htmlFiles,
            destRefs: action.domTransforms,
            destinationPropertyGetter: i => i.state,
        };
        ca.subMerge(sma, context, callback);
    }
//#endregion
}

if (typeof (global) !== 'undefined') {
    var guid = 'tsp-81B44259-976C-4DFC-BE00-6E901415FEF3';
    var globalNS = global[guid] || 'tsp';
    if (!global[globalNS]) global[globalNS] = {};
    global[globalNS].DOMActions = tsp.DOMActions;
}