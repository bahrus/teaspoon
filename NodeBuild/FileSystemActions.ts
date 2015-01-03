import Is = require('./Interfaces');
import u = require('./tspUtil');
import da = require('./DOMActions');
import dbd = require('./DOMBuildDirectives');
//#region File Management
export interface IFileManager {
    resolve(...pathSegments: any[]): string;
    getSeparator(): string;
    readTextFileSync(filePath: string): string;
    readTextFileAsync(filePath: string, callback: (err: Error, data: string) => void);
    listDirectorySync(dirPath: string): string[];
    getExecutingScriptFilePath: () => void;
    writeTextFileSync(filePath: string, content: string): void;
}
export interface IWebFileManager extends IFileManager {

    loadHTML: (html: string) => JQueryStatic
        minify: (filePath: string, callback: (err: Error, min: string) => void) => void;
}

export interface IWebContext extends Is.IContext {
    HTMLOutputs: { [key: string]: JQueryStatic };
    JSOutputs?: { [key: string]: string[] };
    FileManager: IWebFileManager;
}
export interface IWebAction extends Is.IAction {
    do: (action: IWebAction, context: IWebContext, callback?: Is.ICallback) => void;

}

export interface IExportDocumentsToFiles extends IWebAction {
    outputRootDirectoryPath?: string;

}
//#endregion

//#region helper functions
export function testForHtmlFileName(s: string) {
    return u.endsWith(s, '.html');
}

export function testForNonMinifiedJSFileName(s: string) {
    return u.endsWith(s, '.js') && !u.endsWith(s, '.min.js');
}

export function retrieveRootDirectory(context: IWebContext) {
    var wfm = context.FileManager;
    var executingFilePath = wfm.getExecutingScriptFilePath();
    var returnStr = wfm.resolve(executingFilePath, '..') + wfm.getSeparator();
    return returnStr;
}
//#endregion

//#region File Reader
interface IFileReaderActionState extends Is.IActionState {
    content?: string;
}

export interface ITextFileReaderAction extends Is.IAction, IRootDirectoryRetriever {
    relativeFilePath: string;
    state?: IFileReaderActionState;
}

export function readTextFile(action: ITextFileReaderAction, context: IWebContext) {
    var rootdirectory = action.rootDirectoryRetriever(context);
    var wfm = context.FileManager;
    var filePath = wfm.resolve(rootdirectory, action.relativeFilePath);
    action.state = {
        content:wfm.readTextFileSync(filePath),
    };   
}
export interface ICacheFileContents extends Is.IAction {
    cacheKey: string;
    fileReaderAction: ITextFileReaderAction;
}
export function cacheTextFile(action: ICacheFileContents, context: IWebContext, callback: Is.ICallback) {
    action.fileReaderAction.do(action.fileReaderAction, context);
    context.stringCache[action.cacheKey] = action.fileReaderAction.state.content;
    u.endAction(action, callback);

}
//#endregion

//#region Wait for User Input
export interface IWaitForUserInput extends Is.IAction {
}

export function waitForUserInput(action: IWaitForUserInput, context: IWebContext, callback: Is.ICallback) {
    //Todo:  move code into file manager
    var stdin = process['openStdin']();
    process.stdin['setRawMode']();
    console.log('Press ctrl c to exit');
    stdin.on('keypress', function (chunk, key) {
        process.stdout.write('Get Chunk: ' + chunk + '\n');
        if (key && key.ctrl && key.name == 'c') process.exit();
    });
    u.endAction(action, callback);
}
//#endregion

//#region File Selection
export interface IRootDirectoryRetriever {
    rootDirectoryRetriever?: (context: IWebContext) => string;
}

export interface IFileSelectorActionState {
    rootDirectory: string;
    selectedFilePaths?: string[];
}

export interface IFileSelectorAction extends IWebAction, IRootDirectoryRetriever {

    //fileName?: string;
    fileTest?: (s: string) => boolean;
    recursive?: boolean;
    state?: IFileSelectorActionState;
}

export function selectFiles(action: IFileSelectorAction, context: IWebContext) {
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
//#endregion

//#region File Processing


export interface IFileProcessorAction extends IWebAction {
    state?: Is.IFileProcessorActionState;
    fileSubProcessActions?: IWebAction[];


}

//#region HTML File Processing

export interface IHTMLFileProcessorAction extends IFileProcessorAction {
    state?: Is.IHTMLFileProcessorActionState;
}

function processHTMLFileSubRules(action: IHTMLFileProcessorAction, context: IWebContext, data: string) {
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

export function processHTMLFile(action: IHTMLFileProcessorAction, context: IWebContext, callback: Is.ICallback) {
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

//#region JS File Processing
export function minifyJSFile(action: IFileProcessorAction, context: IWebContext, callback: Is.ICallback) {
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

//#endregion 

//#region File Select and Process
export interface ISelectAndProcessFileAction extends IWebAction {
    fileSelector: IFileSelectorAction
        fileProcessor: IFileProcessorAction;

}

export function selectAndProcessFiles(action: ISelectAndProcessFileAction, context: IWebContext, callback: Is.ICallback) {
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

//#endregion
export function exportProcessedDocumentsToFiles(action: IExportDocumentsToFiles, context: IWebContext, callback: Is.ICallback) {
    for (var filePath in context.HTMLOutputs) {
        var $ = <CheerioStatic><any> context.HTMLOutputs[filePath];
        context.FileManager.writeTextFileSync((<string>filePath).replace('.html', '.temp.html'), $.html());
    }
}