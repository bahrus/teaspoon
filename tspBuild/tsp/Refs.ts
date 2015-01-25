if (typeof (global) !== 'undefined') {
    require('./CommonActions');
    require('./ParserActions');
    require('./TypeScriptEntities');
    require('./FileSystemActions');
    require('./DOMActions');
    var _ = <_.LoDashStatic> require('lodash');
    global._ = _;
    var cheerio = require('cheerio');
    global.cheerio = cheerio;
    
}