import Is = require('./Interfaces');
import DOMActions = require('./DOMActions');

var dom = DOMActions;
var removeBuildDirective: DOMActions.IDOMTransformAction = {
    do: dom.DOMTransform,
    selector: {
        cssSelector: 'tsp-design-time',
        do: dom.selectElements,
    },
    elementAction: {
        do: dom.remove
    },
};
var makeJSClobDirective: DOMActions.IDOMTransformAction = {
    do: dom.DOMTransform,
    selector: {
        cssSelector: 'head>script[src]',
        do: dom.selectElements,
        //debug: true,
    },
    elementAction: {
        do: dom.addToJSClob,
    },
};
export var All: Is.IWebAction[] = [removeBuildDirective, makeJSClobDirective];
