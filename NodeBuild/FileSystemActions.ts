import Is = require('./Interfaces');
import u = require('./tspUtil');

export function testForHtmlFileName(s: string) {
    return u.endsWith(s, '.html');
}

export function testForNonMinifiedJSFileName(s: string) {
    return u.endsWith(s, '.js') && !u.endsWith(s, '.min.js');
}

export function rootDirectoryRetriever(context: Is.IBuildContext) {
    var wfm = context.WebFileManager;
    var executingFilePath = wfm.getExecutingScriptFilePath();
    var returnStr = wfm.resolve(executingFilePath, '..') + wfm.getSeparator();
    return returnStr;
}

export function selectFiles(action: Is.IFileSelectorAction, context: Is.IBuildContext) {
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

export function processHTMLFile(action: Is.IHTMLFileProcessorAction, context: Is.IBuildContext) {
    var data = context.WebFileManager.readTextFileSync(action.state.filePath);

    if (action.debug) debugger;
    //var $ = <CheerioStatic> cheerio.load(<string> data);
    //var $any = <any> $;
    //var $ = context.WebFileManager.loadH
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

export function minifyJSFile(action: Is.IFileProcessorAction, context: Is.IBuildContext) {
    console.log('Uglifying ' + action.state.filePath);
    var filePath = action.state.filePath;
    context.WebFileManager.minify(filePath, (err, min) => {
        if (err) {
            console.log('Error uglifying ' + filePath);
        } else {
            console.log('Uglified ' + filePath);
        }
    });
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
    
