/*//#region[mode='cs'] 
module tsp.DOMActions{
    var Is = tsp.Is;
    var u = tsp.util;
*///#endregion[mode='cs']
//#region[mode='ss'] 
import Is = require('./Interfaces');
import u = require('./tspUtil');
//#endregion[mode='ss'] 

    
export function remove(action: Is.IDOMElementBuildAction ) {
    action.state.element.remove();
    u.endAction(action);
}

export function addToJSClob(action: Is.IDOMElementBuildAction, context: Is.IWebContext) {
    var state = action.state;
    var src = action.state.element.attr('src');
    var referringDir = context.WebFileManager.resolve(state.filePath, '..', src);
    u.endAction(action);
    debugger;
    //var filePathToScript = context.WebServerFileHost.readFileFromRelativeUrl(state.filePath, src);
}

export function selectElements(action: Is.IDOMElementCSSSelector, context: Is.IWebContext) {
    if (action.debug) debugger;
    var aS = action.state;
    if (aS.relativeTo) {
        aS.elements = aS.relativeTo.find(action.cssSelector);
    } else {
        aS.elements = aS.$(action.cssSelector);
    }
    u.endAction(action);
}

//function doDomTransformOnElement(i: number, len: number, eA: Is.IDOMElementBuildAction, aSelSt: Is.IDOMElementCSSSelectorState) {
//    if (i >= len) return;

//}
export function DOMTransform(action: Is.IDOMTransformAction, context: Is.IWebContext) {
    var elements: JQuery;
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
            u.endAction(action);
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
                    u.endAction(action);
                }
            };
        }
        //#endregion
    } else {
        u.endAction(action);
    }
    
    
}
/*//#region[mode='cs']
}
*///#endregion[mode='cs']

    