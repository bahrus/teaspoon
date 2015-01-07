import cheerio = require('cheerio');
import ca = require('./CommonActions');
import fsa = require('./FileSystemActions');
import programConfig = require('./ProgramConfig');
import nodeJSImplementations = require('./NodeJSImplementations');
import pa = require('./ParserActions');

var context: fsa.IWebContext = {
    stringCache: {},
    HTMLOutputs: {},
    fileManager: new nodeJSImplementations.NodeJSWebFileManager(),
    processManager: new nodeJSImplementations.NodeJSProcessManager(),
};
var callback: ca.ICallback = (err) => {
    //console.log('finished processing');
};
programConfig.pC.do(programConfig.pC, context, callback);




