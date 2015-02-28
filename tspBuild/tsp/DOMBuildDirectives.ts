﻿//if (typeof (global) !== 'undefined') {
//    require('./Refs');
    
//}

module tsp.DOMBuildDirectives {
    //if (!tsp.DOMActions && typeof(global) !== 'undefined') {
    //    tsp.DOMActions = global.tsp.DOMActions;
    //}
    try {
        require('./Refs');
        global.refs.moduleTarget = tsp;
    } finally { }
    export interface IDOMBuildDirectives extends CommonActions.ITypedActionList<IDOMBuildDirectives> {
        removeBuildDirective?: DOMActions.IDOMTransformAction;
        makeJSClobDirective?: DOMActions.IDOMTransformAction;
        container?: FileSystemActions.ISelectAndProcessFileAction;
    }

    export var domBuildConfig: IDOMBuildDirectives = {
        removeBuildDirective: {
            do: DOMActions.DOMTransform,
            selector: {
                cssSelector: 'tsp-design-time',
                do: DOMActions.selectElements,
            },
            elementAction: {
                do: DOMActions.remove,
            },
        },
        makeJSClobDirective: {
            do: DOMActions.DOMTransform,
            selector: {
                cssSelector: 'head>script[src]',
                do: DOMActions.selectElements,
                //debug: true,
            },
            elementAction: {
                do: DOMActions.addToJSClob,
            },
        },
        subActionsGenerator: [
            i => i.removeBuildDirective,
            i => i.makeJSClobDirective
        ],
    };


}

if (typeof (global) !== 'undefined') {
    var guid = 'tsp-81B44259-976C-4DFC-BE00-6E901415FEF3';
    var globalNS = global[guid] || 'tsp';
    if (!global[globalNS]) global[globalNS] = {};
    global[globalNS].DOMBuildDirectives = tsp.DOMBuildDirectives;
}