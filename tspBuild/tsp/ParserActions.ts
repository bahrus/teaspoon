module tsp.ParserActions {
    //#region Helper functions
    export function endsWith(str: string, suffix: string) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    export function startsWith(str: string, prefix: string) {
        return str.substr(0, prefix.length) === prefix;
    }

    export function replaceStartWith(str: string, prefix: string, replaceText: string) {
        if (!startsWith(str, prefix)) return str;
        return str.substr(prefix.length);
    }

    export function replaceEndWith(str: string, suffix: string, replaceText: string) {
        var iPosOfEnd = str.indexOf(suffix, str.length - suffix.length);
        if (iPosOfEnd === -1) return str;
        return str.substr(0, iPosOfEnd) + replaceText;
    }


//#endregion
}

if (typeof (global) !== 'undefined') {
    var guid = 'tsp-81B44259-976C-4DFC-BE00-6E901415FEF3';
    var globalNS = global[guid] || 'tsp';
    if (!global[globalNS]) global[globalNS] = {};
    global[globalNS].ParserActions = tsp.ParserActions;
}