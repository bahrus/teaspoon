import cheerio = require('cheerio');
import tspInterfaces = require('./Interfaces');
//import buildConfig = require('./buildConfig');
import nodeBuildConfig = require('./NodeJSBuildConfig');
var pathOfScript = process.argv[1];
//var pathOfHtmlFile = pathOfScript.replace('app.js', 'HTML1.html');
//var fs = require('fs');
var rootDir = pathOfScript.replace('app.js', '');
var context: tspInterfaces.tsp.IBuildContext = {
    //rootDirectory: rootDir,
};
var htmlFileBuild = nodeBuildConfig.tsp.NodeBuildConfig.htmlFileBuild;
htmlFileBuild.do(htmlFileBuild, context);
//var xmldom = require('xmldom');
//fs.readFile(pathOfHtmlFile, 'utf8', (err, data) => {
//    var $ = <CheerioStatic> cheerio.load(data);
//    var $any = <any> $;
//    var context: tspInterfaces.tsp.IBuildContext = {
//        rootDirectory
//        //$: <JQueryStatic> $any,
//    };
//    .do(
//    buildConfig.tsp.htmlFileBuildConfig.buildActions.forEach(ba => {
//        ba.do(ba, context);
//    });
//    var outp = $.html();
//    context.HTMLOutputs[pathOfHtmlFile] = $any;
//    debugger;
//});

