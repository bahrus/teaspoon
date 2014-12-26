import Is = require('Interfaces');
export module tsp.StandardActions {
    
    export function removeAction(action: Is.IDOMElementBuildAction ) {
        action.state.element.remove();
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

    export function performTreeNodeAction(action: Is.IDOMTransformTreeNodeBuildAction, context: Is.IBuildContext) {
        var elements : JQuery;
        var p: Is.IDOMTransformTreeNodeBuildAction;
        if (action.state) {
            p = action.state.parent;
        }
        var aSel = action.selector;
        if (!aSel.state) {
            aSel.state = {
                $: action.state.$,
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
                    treeNode: action,
                    $: aSelSt.$,
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
                    };
                    child.do(child, context);
                }
            }
        };
    }

    
}