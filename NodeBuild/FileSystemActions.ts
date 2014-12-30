import Is = require('./Interfaces');
import u = require('./tspUtil');

export function testForHtmlFileName(s: string) {
    return u.endsWith(s, '.html');
}

export function testForNonMinifiedJSFileName(s: string) {
    return u.endsWith(s, '.js') && !u.endsWith(s, '.min.js');
}

export function rootDirectoryRetriever(context: Is.IWebContext) {
    var wfm = context.WebFileManager;
    var executingFilePath = wfm.getExecutingScriptFilePath();
    var returnStr = wfm.resolve(executingFilePath, '..') + wfm.getSeparator();
    return returnStr;
}

export function selectFiles(action: Is.IFileSelectorAction, context: Is.IWebContext) {
    if (action.debug) debugger;
    if (!action.state) {
        action.state = {
            rootDirectory: action.rootDirectoryRetriever(context),
        };
    }
    var files = context.WebFileManager.listDirectorySync(action.state.rootDirectory);
    if (action.fileTest) files = files.filter(action.fileTest);
    files = files.map(s => action.state.rootDirectory + s);
    action.state.selectedFilePaths = files;
}

function processHTMLFileSubRules(action: Is.IHTMLFileProcessorAction, context: Is.IWebContext, data: string) {
    if (action.debug) debugger;
    var $ = context.WebFileManager.loadHTML(data);
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
    var wfm = context.WebFileManager;
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

export function minifyJSFile(action: Is.IFileProcessorAction, context: Is.IWebContext) {
    console.log('Uglifying ' + action.state.filePath);
    var filePath = action.state.filePath;
    context.WebFileManager.minify(filePath, (err, min) => {
        if (err) {
            console.log('Error uglifying ' + filePath);
        } else {
            console.log('Uglified ' + filePath);
        }
        if (!action.state.callback) {
            throw "Unable to minify JS files synchronously";
        }
        u.endAction(action);
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
    
    if (action.sync) {
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
        
    } else {
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
    }
}
    
