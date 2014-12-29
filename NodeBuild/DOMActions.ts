import Is = require('Interfaces');
    
export function remove(action: Is.IDOMElementBuildAction ) {
    action.state.element.remove();
    if (action.state.callback) action.state.callback(null);
}

export function addToJSClob(action: Is.IDOMElementBuildAction, context: Is.IBuildContext) {
    var state = action.state;
    var src = action.state.element.attr('src');
    var referringDir = context.WebFileManager.resolve(state.filePath, '..', src);
    if (action.state.callback) action.state.callback(null);
    //var filePathToScript = context.WebServerFileHost.readFileFromRelativeUrl(state.filePath, src);
}

export function selectElements(action: Is.IDOMElementCSSSelector, context: Is.IBuildContext) {
    if (action.debug) debugger;
    var aS = action.state;
    if (aS.relativeTo) {
        aS.elements = aS.relativeTo.find(action.cssSelector);
    } else {
        aS.elements = aS.$(action.cssSelector);
    }
    if (action.state.callback) action.state.callback(null);
}

//function doDomTransformOnElement(i: number, len: number, eA: Is.IDOMElementBuildAction, aSelSt: Is.IDOMElementCSSSelectorState) {
//    if (i >= len) return;

//}
function endAction(action: Is.IBuildAction) {
    if (action.state && action.state.callback) action.state.callback(null);
}
export function DOMTransform(action: Is.IDOMTransformAction, context: Is.IBuildContext) {
    var elements : JQuery;
    var p: Is.IDOMTransformAction;
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
        if (eA.sync) {
            for (var i = 0, n = aSelSt.elements.length; i < n; i++) {
                var $elem = aSelSt.$(aSelSt.elements[i]);
                eA.state.element = $elem;
                eA.do(eA, context);
            }
            endAction(action);
        } else {
            var i = 0;
            var n = aSelSt.elements.length;
            eA.state.callback = (err) => {
                if (i < n) {
                    var $elem = aSelSt.$(aSelSt.elements[i]);
                    i++;
                    eA.state.element = $elem;
                    eA.do(eA, context);
                } else {
                    endAction(action);
                }
            };
        }
        //#endregion
    } else {
        endAction(action);
    }
    
    
}

    