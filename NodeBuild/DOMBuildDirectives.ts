import ca = require('./CommonActions');
import fsa = require('./FileSystemActions');
import da = require('./DOMActions');

export interface IDOMBuildDirectives{
    removeBuildDirective?: da.IDOMTransformAction;
    makeJSClobDirective?: da.IDOMTransformAction;
}

var domBuildDirectives: IDOMBuildDirectives = {
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
};


var makeJSClobDirective: da.IDOMTransformAction = {
    do: da.DOMTransform,
    selector: {
        cssSelector: 'head>script[src]',
        do: da.selectElements,
        //debug: true,
    },
    elementAction: {
        do: da.addToJSClob,
    },
};
export var All: da.IDOMTransformAction[] = [domBuildDirectives.removeBuildDirective, makeJSClobDirective];
