import cheerio = require('cheerio');
import ca = require('./CommonActions');
import fsa = require('./FileSystemActions');
import programConfig = require('./ProgramConfig');
import nodeJSWebServerFileHost = require('./NodeJSWebFileManager');
import pa = require('./ParserActions');

var context: fsa.IWebContext = {
    stringCache: {},
    HTMLOutputs: {},
    FileManager: new nodeJSWebServerFileHost.NodeJSWebFileManager(),
};
var callback: ca.ICallback = (err) => {
    //console.log('finished processing');
};
programConfig.MainActions.do(programConfig.MainActions, context, callback);




