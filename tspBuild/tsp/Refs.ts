if (typeof (global) !== 'undefined') {
    require('./CommonActions');
    require('./ParserActions');
    require('./TypeScriptEntities');
    require('./FileSystemActions');
    var _ = <_.LoDashStatic> require('lodash');
    global._ = _;
    
}