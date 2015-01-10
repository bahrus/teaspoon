import ca = require('./CommonActions');
import fsa = require('./FileSystemActions');
import da = require('./DOMActions');


var removeBuildDirective: da.IDOMTransformAction = {
    do: da.DOMTransform,
    selector: {
        cssSelector: 'tsp-design-time',
        do: da.selectElements,
    },
    elementAction: {
        do: da.remove
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
export var All: fsa.IWebAction[] = [removeBuildDirective, makeJSClobDirective];
