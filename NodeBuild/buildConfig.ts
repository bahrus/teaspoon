import Interfaces = require('./Interfaces');
import StandardActions = require('./StandardActions');
export module tsp {
    var sa = StandardActions.tsp.StandardActions
    var removeBuildAction: Interfaces.tsp.IDOMTransformTreeNodeBuildAction = {
        do: sa.performTreeNodeAction,
        selector: {
            cssSelector: 'tsp-design-time',
            do: sa.selectElements,
        },
        elementAction: {
            do: sa.removeAction
        },
    };
    export var buildConfig: Interfaces.tsp.IBuildConfig = {
        buildActions: [removeBuildAction],
    };
}