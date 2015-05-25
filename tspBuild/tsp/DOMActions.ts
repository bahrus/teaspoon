
module tsp.DOMActions {
    try {
        require('./Refs');
        global.refs.moduleTarget = tsp;
    } finally { }
    const fsa = FileSystemActions;
    const ca = CommonActions;
    const pa = ParserActions;

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
        const state = action.state;
        const src = action.state.element.attr('src');
        const referringDir = context.fileManager.resolve(state.htmlFile.filePath, '..', src);
        if (!context.JSOutputs) context.JSOutputs = {};
        const jsOutputs = context.JSOutputs;
        if (!jsOutputs[referringDir]) jsOutputs[state.htmlFile.filePath] = [];
        const minifiedVersionFilePath = pa.replaceEndWith(referringDir, '.js', '.min.js');
        if (!context.fileManager.doesFilePathExist(minifiedVersionFilePath)) {
            console.log('minified filepath ' + minifiedVersionFilePath + ' does not exist.');
            ca.endAction(action, callback);
            return;
        }
        const minifiedContent = context.fileManager.readTextFileSync(minifiedVersionFilePath);
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
        const aS = action.state;
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
        let elements: JQuery;
        let p: IDOMTransformAction;
        if (action.state) {
            p = action.state.parent;
        }
        const aSel = action.selector;
        if (!aSel.state) {
            aSel.state = {
                htmlFile: action.state.htmlFile,
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
                htmlFile: aSelSt.htmlFile,
            };
            if (eA.async) {
                let i = 0;
                const n = aSelSt.elements.length;
                const eACallback = (err) => {
                    if (i < n) {
                        const $elem = aSelSt.htmlFile.$(aSelSt.elements[i]);
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
                    const $elem = aSelSt.htmlFile.$(aSelSt.elements[i]);
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
        const htmlFiles = action.htmlFiles;
        const domTransforms = action.domTransforms;
        for (let i = 0, n = htmlFiles.length; i < n; i++) {
            const htmlFile = htmlFiles[i];
            for (let j = 0, m = domTransforms.length; j < m; j++) {
                const domTransform = domTransforms[j];
                domTransform.state = {
                    htmlFile: htmlFile,
                };
               
                domTransform.do(domTransform, context, null);
            }
        }
    }
//#endregion
}

try {
    global.refs.ref = ['DOMActions', tsp.DOMActions];
} finally { }