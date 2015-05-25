if (typeof (global) !== 'undefined') {
    const _ = <_.LoDashStatic> require('lodash');
    global._ = _;
    var cheerio = require('cheerio');
    global.cheerio = cheerio;
    const guid = 'tsp-81B44259-976C-4DFC-BE00-6E901415FEF3';
    const globalNS = global[guid] || 'tsp';
    if (!global.refs) {
        global.refs = {
            set moduleTarget(obj) {
                if (!global[globalNS]) global[globalNS] = {};
                for (const key in global.tsp) {
                    if (!obj[key]) obj[key] = global[globalNS][key];
                }
            },
            set ref(arr) {
                global[globalNS][arr[0]] = arr[1];
            }
        };
    }
    require('./CommonActions');
    require('./ParserActions');
    require('./TypeScriptEntities');
    require('./FileSystemActions');
    require('./DOMActions');
    require('./DOMBuildDirectives');
    require('./NodeJSImplementations');
    require('./BuildConfig');
    
}