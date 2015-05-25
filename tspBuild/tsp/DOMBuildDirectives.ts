

module tsp.DOMBuildDirectives {
    try {
        require('./Refs');
        global.refs.moduleTarget = tsp;
    } finally { }
    export interface IDOMBuildDirectives extends CommonActions.ITypedActionList<IDOMBuildDirectives> {
        removeBuildDirective?: DOMActions.IDOMTransformAction;
        makeJSClobDirective?: DOMActions.IDOMTransformAction;
        container?: FileSystemActions.ISelectAndProcessFileAction;
    }

    export const domBuildConfig: IDOMBuildDirectives = {
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

try {
    global.refs.ref = ['DOMBuildDirectives', tsp.DOMBuildDirectives];
} finally { }