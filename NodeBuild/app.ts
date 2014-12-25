import cheerio = require('cheerio');
import tspInterfaces = require('./Interfaces');
import buildConfig = require('./buildConfig');
var pathOfScript = process.argv[1];
var pathOfHtmlFile = pathOfScript.replace('app.js', 'HTML1.html');
var fs = require('fs');

//var xmldom = require('xmldom');
fs.readFile(pathOfHtmlFile, 'utf8', (err, data) => {
    var $ = <CheerioStatic> cheerio.load(data);
    var $any = <any> $;
    var context: tspInterfaces.tsp.IBuildContext = {
        $: <JQueryStatic> $any,
    };
    buildConfig.tsp.buildConfig.buildActions.forEach(ba => {
        ba.do(ba, context);
    });
    var outp = $.html();
    context.outputs[pathOfHtmlFile] = $any;
    debugger;
});

