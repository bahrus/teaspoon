if (typeof (global) !== 'undefined') {
    require('./Refs');
}
module tsp.CommonActions {
    export var versionKey = 'version';
}

if (typeof (global) !== 'undefined') {
    var guid = 'tsp-81B44259-976C-4DFC-BE00-6E901415FEF3';
    var globalNS = global[guid] || 'tsp';
    if (!global[globalNS]) global[globalNS] = {};
    global[globalNS].CommonActions = tsp.CommonActions;
}
