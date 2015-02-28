if (typeof (global) !== 'undefined') {
    var _ = <_.LoDashStatic> require('lodash');
    global._ = _;
    var cheerio = require('cheerio');
    global.cheerio = cheerio;
    if (!global.refs) {
        global.refs = {
            obj: Object,
            set moduleTarget(obj) {
                for (var key in global.tsp) {
                    if (!obj[key]) obj[key] = global.tsp[key];
                }
                this.obj = obj;
            },
            get moduleTarget() {
                return this.obj;
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