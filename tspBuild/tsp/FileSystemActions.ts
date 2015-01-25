if (typeof (global) !== 'undefined') {
    require('./Refs');
}

module tsp.FileSystemActions {
    var pa = tsp.ParserActions;
    var ca = tsp.CommonActions;
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

    export interface IWebContext extends CommonActions.IContext {
        HTMLOutputs: { [key: string]: JQueryStatic };
        JSOutputs?: { [key: string]: string[] };
        fileManager: IWebFileManager;
    }
    export interface IWebAction extends CommonActions.IAction {
        do: (action: IWebAction, context: IWebContext, callback?: CommonActions.ICallback) => void;

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
            var wfm = context.fileManager;
            return wfm.getWorkingDirectoryPath() + wfm.getSeparator();
        }
    }
//#endregion

    //#region File Reader
    interface IFileReaderActionState extends CommonActions.IActionState {
        content?: string;
    }

    export interface ITextFileReaderAction extends CommonActions.IAction, IRootDirectoryRetriever {
        relativeFilePath: string;
        state?: IFileReaderActionState;
    }

    export function readTextFile(action: ITextFileReaderAction, context: IWebContext) {
        var rootdirectory = action.rootDirectoryRetriever(context);
        var wfm = context.fileManager;
        var filePath = wfm.resolve(rootdirectory, action.relativeFilePath);
        action.state = {
            content: wfm.readTextFileSync(filePath),
        };
    }
    export interface ICacheFileContents extends CommonActions.IAction {
        cacheKey: string;
        fileReaderAction: ITextFileReaderAction;
    }
    export function cacheTextFile(action: ICacheFileContents, context: IWebContext, callback: CommonActions.ICallback) {
        action.fileReaderAction.do(action.fileReaderAction, context);
        context.stringCache[action.cacheKey] = action.fileReaderAction.state.content;
        ca.endAction(action, callback);

    }
//#endregion

    //#region Wait for User Input
    export interface IWaitForUserInput extends CommonActions.IAction {
    }

    export function waitForUserInput(action: IWaitForUserInput, context: IWebContext, callback: CommonActions.ICallback) {
        if (action.debug) debugger;
        if (context.processManager) {
            var test = (chunk: string, key: any) => {
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
        var files = context.fileManager.listDirectorySync(action.state.rootDirectory);
        if (action.fileTest) files = files.filter(action.fileTest);
        files = files.map(s => action.state.rootDirectory + s);
        action.state.selectedFilePaths = files;
    }
//#endregion

    //#region File Processing

    export interface IFileProcessorActionState extends CommonActions.IActionState {
        filePath: string;
    }

    export interface IHTMLFileProcessorActionState extends IFileProcessorActionState, CommonActions.IActionState {
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
        var $ = context.fileManager.loadHTML(data);
        action.state.$ = $;
        if (action.fileSubProcessActions) {
            var n = action.fileSubProcessActions.length;
            for (var i = 0; i < n; i++) {
                var fspa = <IHTMLFileProcessorAction> action.fileSubProcessActions[i];
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
            //var $cheerio = <CheerioStatic> $any;
            //var sOutput = $cheerio.html();
            debugger;
        }
    }

    export function processHTMLFile(action: IHTMLFileProcessorAction, context: IWebContext, callback: CommonActions.ICallback) {
        var wfm = context.fileManager;
        console.log('processing ' + action.state.filePath);
        if (callback) {
            wfm.readTextFileAsync(action.state.filePath,(err, data) => {
                processHTMLFileSubRules(action, context, data);
                callback(err);
            });
        } else {
            var data = wfm.readTextFileSync(action.state.filePath);
            processHTMLFileSubRules(action, context, data);
            ca.endAction(action, callback);
        }

    }
    //#endregion

    //#region JS File Processing
    export function minifyJSFile(action: IFileProcessorAction, context: IWebContext, callback: CommonActions.ICallback) {
        console.log('Uglifying ' + action.state.filePath);
        var filePath = action.state.filePath;
        context.fileManager.minify(filePath,(err, min) => {
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
}

if (typeof (global) !== 'undefined') {
    var guid = 'tsp-81B44259-976C-4DFC-BE00-6E901415FEF3';
    var globalNS = global[guid] || 'tsp';
    if (!global[globalNS]) global[globalNS] = {};
    global[globalNS].FileSystemActions = tsp.FileSystemActions;
}