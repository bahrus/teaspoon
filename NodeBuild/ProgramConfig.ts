/*//#region[mode='cs']
module tsp.MainConfig{
    var Is = tsp.Is;
    var fsa = tsp.FileSystemActions;
    var ua = tsp.UtilityActions;
    var domDirectives = tsp.DOMBuildDirectives;
*///#endregion[mode='cs']
//#region[mode='ss']
import ca = require('./CommonActions');
import fsa = require('./FileSystemActions');
import dbd = require('./DOMBuildDirectives');
//#endregion[mode='ss']


interface IProgramConfig extends ca.ITypedActionList<IProgramConfig> {
    cacheVersionLabel?: fsa.ICacheFileContents;
    minifyJSFiles?: fsa.ISelectAndProcessFileAction;
    selectAndReadHTMLFiles?: fsa.ISelectAndReadHTMLFilesAction;
    exportInMemoryDocumentsToFiles?: fsa.IExportDocumentsToFiles;
    waitForUserInput?: fsa.IWaitForUserInput;
    //domProcessor?: dbd.domBuildDirectives;
    domBuildDirectives?: dbd.IDOMBuildDirectives;
    domProcesor?: ca.DoForEachAction<IProgramConfig, fsa.IHTMLFile>;
}

var versionKey = 'version';

  
export var programConfig: IProgramConfig = {
    do: ca.doSequenceOfTypedActions,
    cacheVersionLabel: {
        do: fsa.cacheTextFile,
        fileReaderAction: {
            do: fsa.readTextFile,
            rootDirectoryRetriever: fsa.commonHelperFunctions.retrieveWorkingDirectory,
            relativeFilePath: 'Version.txt',
        },
        cacheKey: versionKey
    },
    minifyJSFiles: {
        //#region minify JS Files
        do: fsa.selectAndProcessFiles,
        fileSelector: {
            do: fsa.selectFiles,
            fileTest: fsa.commonHelperFunctions.testForNonMinifiedJSFileName,
            rootDirectoryRetriever: fsa.commonHelperFunctions.retrieveWorkingDirectory,
        },
        fileProcessor: {
            do: fsa.minifyJSFile,
            async: true,
        },
        async: true,
        //#endregion
    },
    processHTMLFilesInMemory: {
        //#region Html Files
        do: fsa.selectAndProcessFiles,
        fileSelector: {
            do: fsa.selectFiles,
            fileTest: fsa.commonHelperFunctions.testForHtmlFileName,
            rootDirectoryRetriever: fsa.commonHelperFunctions.retrieveWorkingDirectory,
        },
        fileProcessor: {
            do: fsa.processHTMLFile,
            fileSubProcessActions: dbd.All,
        },
        //#endregion
    },
    exportInMemoryDocumentsToFiles: {
        do: fsa.exportProcessedDocumentsToFiles,
        outputRootDirectoryPath: 'OutputTest',
    },
    waitForUserInput: {
        do: fsa.waitForUserInput,
    },
    subActionsGenerator: [
        i => i.cacheVersionLabel,
        i => i.minifyJSFiles,
        i => i.selectAndReadHTMLFiles,
        i => i.exportInMemoryDocumentsToFiles,
        i => i.waitForUserInput
    ],
    configOneLiners: [
        i => { i.domBuildDirectives.container = i.selectAndReadHTMLFiles; },
        //i => { i.domProcessor.removeBuildDirective.state.$ = i.processHTMLFilesInMemory.fileSelec
    ],
    domProcesor: {
        forEach: i => i.selectAndReadHTMLFiles.state.htmlFiles,
        subActionsGenerator: i => [
            htmlFile => {
                i.domBuildDirectives.removeBuildDirective.state.$ = htmlFile.$;
                return i.domBuildDirectives.removeBuildDirective;
            },
            htmlFile => {
                i.domBuildDirectives.makeJSClobDirective.state.$ = htmlFile.$;
                return i.domBuildDirectives.makeJSClobDirective;
            },
        ],
    },
    async: true,
};
