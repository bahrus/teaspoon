/*//#region[mode='cs']
module tsp.UilityActions{
    var Is = tsp.Is;
*///#endregion[mode='cs']
//#region[mode='ss']
import Is = require('./Interfaces');
//#endregion[mode='ss']

export function doSequenceOfActions(action: Is.IActionList, context: any) {
    if (action.async) {
        var i = 0, n = action.subActions.length;
        action.state = {
            callback: (err) => {
                if (i < n) {
                    var subAction = action.subActions[i];
                }
            },
        };
    } else {
        for (var i = 0, n = action.subActions.length; i < n; i++) {
            var subAction = action.subActions[i];
            subAction.do(subAction, context);
        }
    }
}

/*//#region[mode='cs']
}
*///#endregion[mode='cs']