
module tsp.DOMActions {
    try {
        require('./Refs');
        global.refs.moduleTarget = tsp;
    } finally { }
    var fsa = FileSystemActions;
    var ca = CommonActions;
    var pa = ParserActions;

    //#region DOM Actions
    export interface IUglify {
        uglify(pathOfReferencingFile: string, relativeURL: string): string;
    }

    interface IDOMState  {
        htmlFile: FileSystemActions.IHTMLFile;
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
        var referringDir = context.fileManager.resolve(state.htmlFile.filePath, '..', src);
        if (!context.JSOutputs) context.JSOutputs = {};
        var jsOutputs = context.JSOutputs;
        if (!jsOutputs[referringDir]) jsOutputs[state.htmlFile.filePath] = [];
        var minifiedVersionFilePath = pa.replaceEndWith(referringDir, '.js', '.min.js');
        if (!context.fileManager.doesFilePathExist(minifiedVersionFilePath)) {
            console.log('minified filepath ' + minifiedVersionFilePath + ' does not exist.');
            ca.endAction(action, callback);
            return;
        }
        var minifiedContent = context.fileManager.readTextFileSync(minifiedVersionFilePath);
        jsOutputs[state.htmlFile.filePath].push(minifiedContent);
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
            //aS.elements = aS.$(action.cssSelector);
            aS.elements = aS.htmlFile.$(action.cssSelector);
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
                htmlFile: action.state.htmlFile,
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
                htmlFile: aSelSt.htmlFile,
            };
            if (eA.async) {
                var i = 0;
                var n = aSelSt.elements.length;
                var eACallback = (err) => {
                    if (i < n) {
                        var $elem = aSelSt.htmlFile.$(aSelSt.elements[i]);
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
                    var $elem = aSelSt.htmlFile.$(aSelSt.elements[i]);
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

    //export interface IPutHTMLFileIntoDomTransformAction extends CommonActions.IAction {
    //    htmlFiles: FileSystemActions.IHTMLFile[];
    //    domTransforms: IDOMTransformAction[];
    //}

    export interface IDOMTransformForEachHTMLFileAction<TContainer, TListItem> {
        //htmlFilesGenerator?: (container: TContainer) => FileSystemActions.IHTMLFile[];
        //domTransformsGenerator?: (container: TContainer) => IDOMTransformAction[];
        //putHTMLFileIntoDomTransformGenerator?: (container: TContainer) => IPutHTMLFileIntoDomTransformAction;
        htmlFiles?: FileSystemActions.IHTMLFile[];
        domTransforms?: IDOMTransformAction[];
    }

    export function ApplyDOMTransformsOnHTMLFiles<TContainer, TListItem>(action: IDOMTransformForEachHTMLFileAction<TContainer, TListItem>, context: FileSystemActions.IWebContext, callback: CommonActions.ICallback) {
        var htmlFiles = action.htmlFiles;
        var domTransforms = action.domTransforms;
        for (var i = 0, n = htmlFiles.length; i < n; i++) {
            var htmlFile = htmlFiles[i];
            for (var j = 0, m = domTransforms.length; j < m; j++) {
                var domTransform = domTransforms[j];
                domTransform.state = {
                    htmlFile: htmlFile,
                };
               
                domTransform.do(domTransform, context, null);
            }
        }
    }
//#endregion
}

if (typeof (global) !== 'undefined') {
    var guid = 'tsp-81B44259-976C-4DFC-BE00-6E901415FEF3';
    var globalNS = global[guid] || 'tsp';
    if (!global[globalNS]) global[globalNS] = {};
    global[globalNS].DOMActions = tsp.DOMActions;
}