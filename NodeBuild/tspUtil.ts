//#region[mode='cs'] module tsp.util{
import ca = require('./CommonActions');
import fsa = require('./FileSystemActions');

//from http://stackoverflow.com/questions/280634/endswith-in-javascript
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

export function endAction(action: ca.IAction, callback: ca.ICallback) {
    if (callback) callback(null);
}
//#endregion[mode='cs'] }

