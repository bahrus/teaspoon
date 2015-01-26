if (typeof (global) !== 'undefined') {
    var _ = <_.LoDashStatic> require('lodash');
    global._ = _;
    var cheerio = require('cheerio');
    global.cheerio = cheerio;
    require('./CommonActions');
    require('./ParserActions');
    require('./TypeScriptEntities');
    require('./FileSystemActions');
    require('./DOMActions');
    require('./DOMBuildDirectives');
    require('./NodeJSImplementations');
    require('./BuildConfig');
}