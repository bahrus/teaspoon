import fs = require('fs');
import path = require('path');
import cheerio = require('cheerio');
import Interfaces = require('Interfaces');
export module tsp.NodeBuildActions {

    export function testForHtmlFileName(s: string) {
        return s.lastIndexOf('.html') > s.length - 5;
    }
    export function selectFiles(action: Interfaces.tsp.IFileSelectorAction, context: Interfaces.tsp.IBuildContext) {
        if (action.debug) debugger;
        var files = fs.readdirSync(action.state.rootDirectory);
        if (action.fileTest) files = files.filter(action.fileTest);
        action.state.selectedFilePaths = files;
    }

    export function processHTMLFile(action: Interfaces.tsp.IFileProcessorAction, context: Interfaces.tsp.IBuildContext) {
        fs.readFile(action.state.filePath, 'utf8', (err, data) => {
            var $ = <CheerioStatic> cheerio.load(data);
            var $any = <any> $;
            action.state.$ = <JQueryStatic> $any;
        });
    }

    export function fileBuilder(action: Interfaces.tsp.IFileBuildAction, context: Interfaces.tsp.IBuildContext) {
        if (action.debug) debugger;
        var fs = action.fileSelector;
        if (!fs.state) {
            fs.state = {
                rootDirectory: context.rootDirectory,
            };
        }
        fs.do(fs, context);
        var fp = action.fileProcessor;
        for (var i = 0, n = fs.state.selectedFilePaths.length; i < n; i++) {
            var filePath = fs.state.selectedFilePaths[i];
            fp.state.filePath = filePath;
            fp.do(fp, context);
        }
    }
    
}