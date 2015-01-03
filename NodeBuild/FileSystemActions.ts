﻿import Is = require('./Interfaces');
import u = require('./tspUtil');
import da = require('./DOMActions');
import dbd = require('./DOMBuildDirectives');

export interface ISelectAndProcessFileAction extends Is.IWebAction {
    fileSelector: Is.IFileSelectorAction
        fileProcessor: IFileProcessorAction;

}

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

export function waitForUserInput(action: Is.IWaitForUserInput, context: Is.IWebContext, callback: Is.ICallback) {
    var stdin = process['openStdin']();
    process.stdin['setRawMode']();
    console.log('Press ctrl c to exit');
    stdin.on('keypress', function (chunk, key) {
        process.stdout.write('Get Chunk: ' + chunk + '\n');
        if (key && key.ctrl && key.name == 'c') process.exit();
    });
    u.endAction(action, callback);
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


//#region File Processing


export interface IFileProcessorAction extends Is.IWebAction {
    state?: Is.IFileProcessorActionState;
    fileSubProcessActions?: Is.IWebAction[];


}

//#region HTML File Processing

export interface IHTMLFileProcessorAction extends IFileProcessorAction {
    state?: Is.IHTMLFileProcessorActionState;
}

function processHTMLFileSubRules(action: IHTMLFileProcessorAction, context: Is.IWebContext, data: string) {
    if (action.debug) debugger;
    var $ = context.FileManager.loadHTML(data);
    action.state.$ = $;
    if (action.fileSubProcessActions) {
        for (var i = 0, n = action.fileSubProcessActions.length; i < n; i++) {
            var fspa = <da.IDOMTransformAction> action.fileSubProcessActions[i];
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

export function processHTMLFile(action: IHTMLFileProcessorAction, context: Is.IWebContext, callback: Is.ICallback) {
    var wfm = context.FileManager;
    console.log('processing ' + action.state.filePath);
    if (callback) {
        wfm.readTextFileAsync(action.state.filePath, (err, data) => {
            processHTMLFileSubRules(action, context, data);
            callback(err);
        });
    } else {
        var data = wfm.readTextFileSync(action.state.filePath);
        processHTMLFileSubRules(action, context, data);
        u.endAction(action, callback);
    }
        
}
//#endregion

export function minifyJSFile(action: IFileProcessorAction, context: Is.IWebContext, callback: Is.ICallback) {
    console.log('Uglifying ' + action.state.filePath);
    var filePath = action.state.filePath;
    context.FileManager.minify(filePath, (err, min) => {
        if (err) {
            console.log('Error uglifying ' + filePath);
        } else {
            console.log('Uglified ' + filePath);
        }
        if (!callback) {
            throw "Unable to minify JS files synchronously";
        }
        u.endAction(action, callback);
    });
    
}

//#endregion 

export function selectAndProcessFiles(action: ISelectAndProcessFileAction, context: Is.IWebContext, callback: Is.ICallback) {
    if (this.debug) debugger;
    var fs = action.fileSelector;
    fs.do(fs, context);
    var selectedFilePaths = fs.state.selectedFilePaths;
    var len = selectedFilePaths.length;
    if (len === 0) {
        u.endAction(action, callback);
        return;
    }
    var fp = action.fileProcessor;
    if (action.async) {
        var idx = 0;
        var fpCallback = (err) => {
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
                fp.do(fp, context, fpCallback);
            } else {
                u.endAction(action, callback);
            }
        }
        fpCallback(null);
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
        u.endAction(action, callback);
    }
     
    
}

export function exportProcessedDocumentsToFiles(action: Is.IExportDocumentsToFiles, context: Is.IWebContext, callback: Is.ICallback) {
    for (var filePath in context.HTMLOutputs) {
        var $ = <CheerioStatic><any> context.HTMLOutputs[filePath];
        context.FileManager.writeTextFileSync((<string>filePath).replace('.html', '.temp.html'), $.html());
    }
}