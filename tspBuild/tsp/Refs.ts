if (typeof (global) !== 'undefined') {
    require('./CommonActions');
    require('./ParserActions');
    require('./TypeScriptEntities');

    var _ = <_.LoDashStatic> require('lodash');
    global._ = _;
    
}