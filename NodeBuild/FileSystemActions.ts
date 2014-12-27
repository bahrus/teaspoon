//import fs = require('fs');
import path = require('path');
import cheerio = require('cheerio');
import Is = require('./Interfaces');
import u = require('./tspUtil');

export function testForHtmlFileName(s: string) {
    return u.endsWith(s, '.html');
}
export function rootDirectoryRetriever() {
    var pathOfScript = process.argv[1];
    var rootDir = pathOfScript.replace('app.js', '');
    return rootDir;
}

export function selectFiles(action: Is.IFileSelectorAction, context: Is.IBuildContext) {
    if (action.debug) debugger;
    if (!action.state) {
        action.state = {
            rootDirectory: action.rootDirectoryRetriever(),
        };
    }
    var files = context.WebFileManager.listDirectorySync(action.state.rootDirectory);
    if (action.fileTest) files = files.filter(action.fileTest);
    files = files.map(s => action.state.rootDirectory + s);
    action.state.selectedFilePaths = files;
}

export function processHTMLFile(action: Is.IHTMLFileProcessorAction, context: Is.IBuildContext) {
    var data = context.WebFileManager.readTextFileSync(action.state.filePath);

    if (action.debug) debugger;
    var $ = <CheerioStatic> cheerio.load(<string> data);
    var $any = <any> $;
    action.state.$ = <JQueryStatic> $any;
    if (action.fileSubProcessActions) {
        for (var i = 0, n = action.fileSubProcessActions.length; i < n; i++) {
            var fspa = <Is.IDOMTransformAction> action.fileSubProcessActions[i];
            fspa.state = {
                $: action.state.$,
                filePath: action.state.filePath,
            };
            fspa.do(fspa, context);
        }
    }
    if (!context.HTMLOutputs) context.HTMLOutputs = {};
    context.HTMLOutputs[action.state.filePath] = action.state.$;
    if (action.debug) {
        var $any = <any> action.state.$;
        var $cheerio = <CheerioStatic> $any;
        var sOutput = $cheerio.html();
        debugger;
    }
        
}

export function fileBuilder(action: Is.IFileBuildAction, context: Is.IBuildContext) {
    if (this.debug) debugger;
    var fs = action.fileSelector;
    fs.do(fs, context);
    var fp = action.fileProcessor;
        
    for (var i = 0, n = fs.state.selectedFilePaths.length; i < n; i++) {
        var filePath = fs.state.selectedFilePaths[i];
        if (!fp.state) {
            fp.state = {
                filePath: filePath,
            };
        }
        fp.state.filePath = filePath;
        fp.do(fp, context);
    }
}
    
