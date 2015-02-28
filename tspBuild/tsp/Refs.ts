if (typeof (global) !== 'undefined') {
    var _ = <_.LoDashStatic> require('lodash');
    global._ = _;
    var cheerio = require('cheerio');
    global.cheerio = cheerio;
    var guid = 'tsp-81B44259-976C-4DFC-BE00-6E901415FEF3';
    var globalNS = global[guid] || 'tsp';
    if (!global.refs) {
        global.refs = {
            obj: Object,
            set moduleTarget(obj) {
                if (!global[globalNS]) global[globalNS] = {};
                for (var key in global.tsp) {
                    if (!obj[key]) obj[key] = global[globalNS][key];
                }
                this.obj = obj;
            },
            get moduleTarget() {
                return this.obj;
            },
            set nameTBD(arr) {
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