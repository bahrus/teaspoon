﻿import ca = require('./CommonActions');
import pa = require('./ParserActions');
//#region File Management
export interface IFileManager {
    resolve(...pathSegments: any[]): string;
    getSeparator(): string;
    readTextFileSync(filePath: string): string;
    readTextFileAsync(filePath: string, callback: (err: Error, data: string) => void);
    listDirectorySync(dirPath: string): string[];
    getExecutingScriptFilePath: () => string;
    getWorkingDirectoryPath: () => string;
    writeTextFileSync(filePath: string, content: string): void;
}
export interface IWebFileManager extends IFileManager {

    loadHTML: (html: string) => JQueryStatic
        minify: (filePath: string, callback: (err: Error, min: string) => void) => void;
}

export interface IWebContext extends ca.IContext {
    HTMLOutputs: { [key: string]: JQueryStatic };
    JSOutputs?: { [key: string]: string[] };
    fileManager: IWebFileManager;
}
export interface IWebAction extends ca.IAction {
    do: (action: IWebAction, context: IWebContext, callback?: ca.ICallback) => void;

}

export interface IExportDocumentsToFiles extends IWebAction {
    outputRootDirectoryPath?: string;

}
//#endregion

//#region helper functions
export module commonHelperFunctions {
    export function testForHtmlFileName(s: string) {
        return pa.endsWith(s, '.html');
    }

    export function testForNonMinifiedJSFileName(s: string) {
        return pa.endsWith(s, '.js') && !pa.endsWith(s, '.min.js');
    }

    export function testForTsFileName(s: string) {
        return pa.endsWith(s, '.ts');
    }

    export function retrieveWorkingDirectory(context: IWebContext) {
        const wfm = context.fileManager;
        return wfm.getWorkingDirectoryPath() + wfm.getSeparator();
    }
}
//#endregion

//#region File Reader
interface IFileReaderActionState extends ca.IActionState {
    content?: string;
}

export interface ITextFileReaderAction extends ca.IAction, IRootDirectoryRetriever {
    relativeFilePath: string;
    state?: IFileReaderActionState;
}

export function readTextFile(action: ITextFileReaderAction, context: IWebContext) {
    const rootdirectory = action.rootDirectoryRetriever(context);
    const wfm = context.fileManager;
    const filePath = wfm.resolve(rootdirectory, action.relativeFilePath);
    action.state = {
        content:wfm.readTextFileSync(filePath),
    };   
}
export interface ICacheFileContents extends ca.IAction {
    cacheKey: string;
    fileReaderAction: ITextFileReaderAction;
}
export function cacheTextFile(action: ICacheFileContents, context: IWebContext, callback: ca.ICallback) {
    action.fileReaderAction.do(action.fileReaderAction, context);
    context.stringCache[action.cacheKey] = action.fileReaderAction.state.content;
    ca.endAction(action, callback);

}
//#endregion

//#region Wait for User Input
export interface IWaitForUserInput extends ca.IAction {
}

export function waitForUserInput(action: IWaitForUserInput, context: IWebContext, callback: ca.ICallback) {
    if (action.debug) debugger;
    if (context.processManager) {
        const test = (chunk: string, key: any) => {
            return key && key.ctrl && key.name == 'c';
        }
        context.processManager.WaitForUserInputAndExit('Press ctrl c to exit', test);
    }
    ca.endAction(action, callback);
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
    let files = context.fileManager.listDirectorySync(action.state.rootDirectory);
    if (action.fileTest) files = files.filter(action.fileTest);
    files = files.map(s => action.state.rootDirectory + s);
    action.state.selectedFilePaths = files;
}
//#endregion

//#region File Processing

export interface IFileProcessorActionState extends ca.IActionState {
    filePath: string;
}

export interface IHTMLFileProcessorActionState extends IFileProcessorActionState, ca.IActionState {
    $: JQueryStatic
}
export interface IFileProcessorAction extends IWebAction {
    state?: IFileProcessorActionState;
    fileSubProcessActions?: IWebAction[];


}

//#region HTML File Processing

export interface IHTMLFileProcessorAction extends IFileProcessorAction {
    state?: IHTMLFileProcessorActionState;
}

function processHTMLFileSubRules(action: IHTMLFileProcessorAction, context: IWebContext, data: string) {
    if (action.debug) debugger;
    const $ = context.fileManager.loadHTML(data);
    action.state.$ = $;
    if (action.fileSubProcessActions) {
        const n = action.fileSubProcessActions.length;
        for (let i = 0; i < n; i++) {
            const fspa = <IHTMLFileProcessorAction> action.fileSubProcessActions[i];
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
        const $any = <any> action.state.$;
        const $cheerio = <CheerioStatic> $any;
        const sOutput = $cheerio.html();
        debugger;
    }
}

export function processHTMLFile(action: IHTMLFileProcessorAction, context: IWebContext, callback: ca.ICallback) {
    const wfm = context.fileManager;
    console.log('processing ' + action.state.filePath);
    if (callback) {
        wfm.readTextFileAsync(action.state.filePath, (err, data) => {
            processHTMLFileSubRules(action, context, data);
            callback(err);
        });
    } else {
        const data = wfm.readTextFileSync(action.state.filePath);
        processHTMLFileSubRules(action, context, data);
        ca.endAction(action, callback);
    }
        
}
//#endregion

//#region JS File Processing
export function minifyJSFile(action: IFileProcessorAction, context: IWebContext, callback: ca.ICallback) {
    console.log('Uglifying ' + action.state.filePath);
    const filePath = action.state.filePath;
    context.fileManager.minify(filePath, (err, min) => {
        if (err) {
            console.log('Error uglifying ' + filePath);
        } else {
            console.log('Uglified ' + filePath);
        }
        if (!callback) {
            throw "Unable to minify JS files synchronously";
        }
        ca.endAction(action, callback);
    });
    
}
//#endregion

//#endregion 

//#region File Select and Process
export interface ISelectAndProcessFileAction extends IWebAction {
    fileSelector?: IFileSelectorAction
    fileProcessor?: IFileProcessorAction;
}

export function selectAndProcessFiles(action: ISelectAndProcessFileAction, context: IWebContext, callback: ca.ICallback) {
    if (this.debug) debugger;
    const fs = action.fileSelector;
    fs.do(fs, context);
    const selectedFilePaths = fs.state.selectedFilePaths;
    const len = selectedFilePaths.length;
    if (len === 0) {
        ca.endAction(action, callback);
        return;
    }
    const fp = action.fileProcessor;
    if (action.async) {
        let idx = 0;
        const fpCallback = (err) => {
            if (idx < len) {
                const filePath = selectedFilePaths[idx];
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
                ca.endAction(action, callback);
            }
        }
        fpCallback(null);
    } else {
        const n = fs.state.selectedFilePaths.length;
        for (let i = 0; i < n; i++) {
            let filePath = fs.state.selectedFilePaths[i];
            if (!fp.state) {
                fp.state = {
                    filePath: filePath,
                };
            } else {
                fp.state.filePath = filePath;
            }
            fp.do(fp, context);
        }
        ca.endAction(action, callback);
    }
     
    
}

export interface IHTMLFile {
    filePath: string;
    $: JQueryStatic;
}

interface ISelectAndReadHTLMFilesActionState {
    htmlFiles?: IHTMLFile[];
}

export interface ISelectAndReadHTMLFilesAction extends IWebAction {
    fileSelector: IFileSelectorAction;
    fileProcessor: IFileProcessorAction;
    state?: ISelectAndReadHTLMFilesActionState;
}

//#endregion

//#region Exporting Processed Documeents to Files
export function exportProcessedDocumentsToFiles(action: IExportDocumentsToFiles, context: IWebContext, callback: ca.ICallback) {
    if (action.debug) debugger;
    for (let filePath in context.HTMLOutputs) {
        const $ = <CheerioStatic><any> context.HTMLOutputs[filePath];
        context.fileManager.writeTextFileSync((<string>filePath).replace('.html', '.temp.html'), $.html());
    }
    ca.endAction(action, callback);
}
//#endregion