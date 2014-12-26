import cheerio = require('cheerio');
import Is = require('./Interfaces');
import mainConfig = require('./MainConfig');
var context: Is.IBuildContext = {
};
var htmlFileBuild = mainConfig.htmlFileBuild;
htmlFileBuild.do(htmlFileBuild, context);

