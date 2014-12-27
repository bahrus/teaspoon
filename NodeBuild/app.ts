import cheerio = require('cheerio');
import Is = require('./Interfaces');
import mainConfig = require('./MainConfig');
import nodeJSWebServerFileHost = require('./NodeJSWebFileManager');
var context: Is.IBuildContext = {
    WebFileManager: new nodeJSWebServerFileHost.NodeJSWebFileManager(),
};
var htmlFileBuild = mainConfig.htmlFileBuild;
htmlFileBuild.do(htmlFileBuild, context);

