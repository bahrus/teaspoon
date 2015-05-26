var tsp;
(function (tsp) {
    var CommonActions;
    (function (CommonActions) {
        try {
            require('./Refs');
            global.refs.moduleTarget = tsp;
        }
        finally { }
        CommonActions.versionKey = 'version';
        function endAction(action, callback) {
            if (callback)
                callback(null);
        }
        CommonActions.endAction = endAction;
        function logToConsole(messageAction, context, callback) {
            var mA = messageAction;
            mA.state = {
                dynamicMessage: mA.message ? mA.message : '',
            };
            var mS = mA.state;
            if (mA.messageGenerator) {
                var genMessage = mA.messageGenerator(mA);
                genMessage = (mS.dynamicMessage ? (mS.dynamicMessage + ' ') : '') + genMessage;
                mS.dynamicMessage = genMessage;
            }
            console.log(mS.dynamicMessage);
        }
        CommonActions.logToConsole = logToConsole;
        function doSequenceOfTypedActions(action, context, callback) {
            var t = action;
            if (!action.subActionsGenerator || action.subActionsGenerator.length === 0) {
                endAction(action, callback);
                return;
            }
            var subActionGenerator = action.subActionsGenerator[0];
            var subAction = subActionGenerator(t);
            if (subAction.async) {
                var seqCallback = function (err) {
                    action.subActionsGenerator = _.rest(action.subActionsGenerator);
                    doSequenceOfTypedActions(action, context, callback);
                };
                subAction.do(subAction, context, seqCallback);
            }
            else {
                subAction.do(subAction, context, null);
                action.subActionsGenerator = _.rest(action.subActionsGenerator);
                doSequenceOfTypedActions(action, context, callback);
            }
        }
        CommonActions.doSequenceOfTypedActions = doSequenceOfTypedActions;
        function merge(mergeAction, context, callback) {
            var n = mergeAction.srcRefs.length;
            for (var i = 0; i < n; i++) {
                var srcRef = mergeAction.srcRefs[i];
                _.merge(srcRef, mergeAction.destRef);
            }
        }
        CommonActions.merge = merge;
        function subMerge(subMergeAction, context, callback) {
            var dpg = subMergeAction.destinationPropertyGetter;
            var spg = subMergeAction.sourcePropertyGetter;
            var srcRefs = subMergeAction.srcRefs;
            if (!srcRefs) {
                endAction(subMergeAction, callback);
                return;
            }
            var noOfSrcRefs = srcRefs.length;
            var destRefs = subMergeAction.destRefs;
            var noOfDestRefs = destRefs.length;
            //const destProp = dpg(dr);
            for (var i = 0; i < noOfSrcRefs; i++) {
                var srcRef = srcRefs[i];
                var srcProp = spg(srcRef);
                for (var j = 0; j < noOfDestRefs; j++) {
                    var destRef = destRefs[j];
                    var destProp = dpg(destRef);
                    _.merge(srcProp, destProp);
                    destRef.do(destRef, context, callback);
                }
            }
        }
        CommonActions.subMerge = subMerge;
    })(CommonActions = tsp.CommonActions || (tsp.CommonActions = {}));
})(tsp || (tsp = {}));
try {
    global.refs.ref = ['CommonActions', tsp.CommonActions];
}
finally { }
//# sourceMappingURL=CommonActions.js.map