/*//#region[mode='cs']
module tsp.UilityActions{
    var Is = tsp.Is;
*///#endregion[mode='cs']
//#region[mode='ss']
import Is = require('./Interfaces');
//#endregion[mode='ss']

export function doSequenceOfActions(action: Is.IActionList, context: any) {
    for (var i = 0, n = action.subActions.length; i < n; i++) {
        var subAction = action.subActions[i];
        subAction.do(subAction, context);
    }
}

/*//#region[mode='cs']
}
*///#endregion[mode='cs']