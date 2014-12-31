﻿import Is = require('./Interfaces');
import u = require('./tspUtil');

export function testForHtmlFileName(s: string) {
    return u.endsWith(s, '.html');
}

export function testForNonMinifiedJSFileName(s: string) {
    return u.endsWith(s, '.js') && !u.endsWith(s, '.min.js');
}

export function retrieveRootDirectory(context: Is.IWebContext) {
    var wfm = context.FileManager;
    var executingFilePath = wfm.getExecutingScriptFilePath();
    var returnStr = wfm.resolve(executingFilePath, '..') + wfm.getSeparator();
    return returnStr;
}

export function readTextFile(action: Is.ITextFileReaderAction, context: Is.IWebContext) {
    var rootdirectory = action.rootDirectoryRetriever(context);
    var wfm = context.FileManager;
    var filePath = wfm.resolve(rootdirectory, action.relativeFilePath);
    action.state = {
        content:wfm.readTextFileSync(filePath),
    };   
}

export function cacheTextFile(action: Is.ICacheFileContents, context: Is.IWebContext, callback: Is.ICallback) {
    action.fileReaderAction.do(action.fileReaderAction, context);
    context.stringCache[action.cacheKey] = action.fileReaderAction.state.content;
    u.endAction(action, callback);

}

export function selectFiles(action: Is.IFileSelectorAction, context: Is.IWebContext) {
    if (action.debug) debugger;
    if (!action.state) {
        action.state = {
            rootDirectory: action.rootDirectoryRetriever(context),
        };
    }
    var files = context.FileManager.listDirectorySync(action.state.rootDirectory);
    if (action.fileTest) files = files.filter(action.fileTest);
    files = files.map(s => action.state.rootDirectory + s);
    action.state.selectedFilePaths = files;
}

function processHTMLFileSubRules(action: Is.IHTMLFileProcessorAction, context: Is.IWebContext, data: string) {
    if (action.debug) debugger;
    var $ = context.FileManager.loadHTML(data);
    action.state.$ = $;
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

export function processHTMLFile(action: Is.IHTMLFileProcessorAction, context: Is.IWebContext) {
    var wfm = context.FileManager;
    console.log('processing ' + action.state.filePath);
    if (action.state.callback) {
        wfm.readTextFileAsync(action.state.filePath, (err, data) => {
            processHTMLFileSubRules(action, context, data);
            action.state.callback(err);
        });
    } else {
        var data = wfm.readTextFileSync(action.state.filePath);
        processHTMLFileSubRules(action, context, data);
        
    }
        
}

export function minifyJSFile(action: Is.IFileProcessorAction, context: Is.IWebContext, callback: Is.ICallback) {
    console.log('Uglifying ' + action.state.filePath);
    var filePath = action.state.filePath;
    context.FileManager.minify(filePath, (err, min) => {
        if (err) {
            console.log('Error uglifying ' + filePath);
        } else {
            console.log('Uglified ' + filePath);
        }
        if (!action.state.callback) {
            throw "Unable to minify JS files synchronously";
        }
        u.endAction(action, callback);
    });
    
}

export function fileBuilder(action: Is.IFileBuildAction, context: Is.IWebContext) {
    if (this.debug) debugger;
    var fs = action.fileSelector;
    fs.do(fs, context);
    var selectedFilePaths = fs.state.selectedFilePaths;
    var len = selectedFilePaths.length;
    if (len === 0) return;
    var fp = action.fileProcessor;
    if (action.async) {
        var idx = 0;
        fp.state.callback = (err) => {
            if (idx < len) {
                var filePath = selectedFilePaths[idx];
                idx++;
                if (!fp.state) {
                    fp.state = {
                        filePath: filePath,
                    }
                } else {
                    fp.state.filePath = filePath;
                }
                fp.do(fp, context);
            }
        }
        fp.state.callback(null);
    } else {
        for (var i = 0, n = fs.state.selectedFilePaths.length; i < n; i++) {
            var filePath = fs.state.selectedFilePaths[i];
            if (!fp.state) {
                fp.state = {
                    filePath: filePath,
                };
            } else {
                fp.state.filePath = filePath;
            }
            fp.do(fp, context);
        }
    }
     
    
}
    
