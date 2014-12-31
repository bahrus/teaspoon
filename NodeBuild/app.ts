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
programConfig.MainActions.do(programConfig.MainActions, context);



