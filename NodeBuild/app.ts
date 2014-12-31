import cheerio = require('cheerio');
import Is = require('./Interfaces');
import programConfig = require('./ProgramConfig');
import nodeJSWebServerFileHost = require('./NodeJSWebFileManager');
import u = require('./tspUtil');

var context: Is.IWebContext = {
    stringCache: {},
    HTMLOutputs: {},
    FileManager: new nodeJSWebServerFileHost.NodeJSWebFileManager(),
};
var callback: Is.ICallback = (err) => {
    //console.log('finished processing');
};
programConfig.MainActions.do(programConfig.MainActions, context, callback);




