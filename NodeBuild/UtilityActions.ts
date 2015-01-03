/*//#region[mode='cs']
module tsp.UilityActions{
    var Is = tsp.Is;
    var u = tsp.util
*///#endregion[mode='cs']
//#region[mode='ss']
import ca = require('./CommonActions');
import u = require('./tspUtil');
//#endregion[mode='ss']

export function doSequenceOfActions(action: ca.IActionList, context: ca.IContext, callback: ca.ICallback) {
    if (action.async) {
        var i = 0, n = action.subActions.length;
        var seqCallback: ca.ICallback = (err) => {
            if (i < n) {
                var subAction = action.subActions[i];
                i++;
                subAction.do(subAction, context, seqCallback);
            } else {
                ca.endAction(action, callback);
            }
        };
        seqCallback(null);
    } else {
        for (var i = 0, n = action.subActions.length; i < n; i++) {
            var subAction = action.subActions[i];
            subAction.do(subAction, context);
        }
        ca.endAction(action, callback);
    }
}

/*//#region[mode='cs']
}
*///#endregion[mode='cs']