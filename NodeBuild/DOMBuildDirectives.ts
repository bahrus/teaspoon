import ca = require('./CommonActions');
import fsa = require('./FileSystemActions');
import da = require('./DOMActions');

export interface IDOMBuildDirectives extends ca.ITypedActionList<IDOMBuildDirectives>{
    removeBuildDirective?: da.IDOMTransformAction;
    makeJSClobDirective?: da.IDOMTransformAction;
    container?: fsa.ISelectAndProcessFileAction;
}

export const domBuildConfig: IDOMBuildDirectives = {
    removeBuildDirective:  {
        do: da.DOMTransform,
        selector: {
            cssSelector: 'tsp-design-time',
            do: da.selectElements,
        },
        elementAction: {
            do: da.remove
        },
    },
    makeJSClobDirective: {
        do: da.DOMTransform,
        selector: {
            cssSelector: 'head>script[src]',
            do: da.selectElements,
            //debug: true,
        },
        elementAction: {
            do: da.addToJSClob,
        },
    },
    subActionsGenerator: [
        i => i.removeBuildDirective,
        i => i.makeJSClobDirective
    ],
};


