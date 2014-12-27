import Is = require('Interfaces');
    
export function remove(action: Is.IDOMElementBuildAction ) {
    action.state.element.remove();
}

export function addToJSClob(action: Is.IDOMElementBuildAction, context: Is.IBuildContext) {
    var state = action.state;
    var src = action.state.element.attr('src');
    var referringDir = context.WebFileManager.resolve(state.filePath, '..', src);
    //var filePathToScript = context.WebServerFileHost.readFileFromRelativeUrl(state.filePath, src);
    debugger;
}

export function selectElements(action: Is.IDOMElementCSSSelector, context: Is.IBuildContext) {
    if (action.debug) debugger;
    var aS = action.state;
    if (aS.relativeTo) {
        aS.elements = aS.relativeTo.find(action.cssSelector);
    } else {
        aS.elements = aS.$(action.cssSelector);
    }
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
    for (var i = 0, n = aSelSt.elements.length; i < n; i++) {
        var $elem = aSelSt.$(aSelSt.elements[i]);
        var eA = action.elementAction;
        if (eA) {
            eA.state = {
                element: $elem,
                DOMTransform: action,
                $: aSelSt.$,
                filePath: aSelSt.filePath,
            };
            eA.do(eA, context);
        }
        var children = action.children;
        if (children) {
            for (var i = 0, n = children.length; i < n; i++) {
                var child = children[i];
                child.state = {
                    parent: action,
                    $: action.state.$,
                    filePath: action.state.filePath,
                };
                child.do(child, context);
            }
        }
    };
}

    