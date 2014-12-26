import Is = require('./Interfaces');
import StandardActions = require('./StandardActions');
export module tsp {
    var sa = StandardActions.tsp.StandardActions
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