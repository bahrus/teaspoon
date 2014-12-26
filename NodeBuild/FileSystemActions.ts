import fs = require('fs');
import path = require('path');
import cheerio = require('cheerio');
import Is = require('Interfaces');
//export module tsp.NodeBuildActions {

    export function testForHtmlFileName(s: string) {
        var iPosOfHtml = s.lastIndexOf('.html');
        if (iPosOfHtml == -1) return false;
        return iPosOfHtml == s.length - 5;
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
        var files = fs.readdirSync(action.state.rootDirectory);
        if (action.fileTest) files = files.filter(action.fileTest);
        files = files.map(s => action.state.rootDirectory + s);
        action.state.selectedFilePaths = files;
    }

    export function processHTMLFile(action: Is.IHTMLFileProcessorAction, context: Is.IBuildContext) {
        fs.readFile(action.state.filePath, 'utf8', (err, data) => {
            if (action.debug) debugger;
            var $ = <CheerioStatic> cheerio.load(data);
            var $any = <any> $;
            action.state.$ = <JQueryStatic> $any;
            if (action.fileSubProcessActions) {
                for (var i = 0, n = action.fileSubProcessActions.length; i < n; i++) {
                    var fspa = <Is.IDOMTransformTreeNodeBuildAction> action.fileSubProcessActions[i];
                    fspa.state = {
                        $: action.state.$,
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
        });
        
    }

    export function fileBuilder(action: Is.IFileBuildAction, context: Is.IBuildContext) {
        if (action.debug) debugger;
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
    
//}