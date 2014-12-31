/*//#region[mode='cs']
module tsp.UilityActions{
    var Is = tsp.Is;
    var u = tsp.util
*///#endregion[mode='cs']
//#region[mode='ss']
import Is = require('./Interfaces');
import u = require('./tspUtil');
//#endregion[mode='ss']

export function doSequenceOfActions(action: Is.IActionList, context: Is.IContext, callback: Is.ICallback) {
    if (action.async) {
        var i = 0, n = action.subActions.length;
        var seqCallback: Is.ICallback = (err) => {
            if (i < n) {
                var subAction = action.subActions[i];
                i++;
                subAction.do(subAction, context, seqCallback);
            } else {
                u.endAction(action, callback);
            }
        };
    } else {
        for (var i = 0, n = action.subActions.length; i < n; i++) {
            var subAction = action.subActions[i];
            subAction.do(subAction, context);
        }
        u.endAction(action, callback);
    }
}

/*//#region[mode='cs']
}
*///#endregion[mode='cs']