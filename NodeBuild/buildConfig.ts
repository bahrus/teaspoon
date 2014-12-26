import Is = require('./Interfaces');
import DOMActions = require('./DOMActions');
export module tsp {
    var sa = DOMActions;
    var removeBuildAction: Is.IDOMTransformTreeNodeBuildAction = {
        do: sa.performTreeNodeAction,
        selector: {
            cssSelector: 'tsp-design-time',
            do: sa.selectElements,
            //debug: true,
        },
        elementAction: {
            do: sa.removeAction
        },
    };
    export var htmlFileBuildConfig: Is.IBuildConfig = {
        buildActions: [removeBuildAction],
    };
}