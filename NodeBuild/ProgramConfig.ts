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

const versionKey = 'version';

export const programConfig: IProgramConfig = {
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
    domBuildDirectives: dbd.domBuildConfig,
    domProcesor: {
        forEach: i => i.selectAndReadHTMLFiles.state.htmlFiles,
        subActionsGenerator: i => [
            htmlFile => {
                const directive = i.domBuildDirectives.removeBuildDirective;
                directive.state.$ = htmlFile.$;
                return directive;
            },
            htmlFile => {
                const directive = i.domBuildDirectives.makeJSClobDirective;
                directive.state.$ = htmlFile.$;
                return directive;
            },
        ],
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
        i => i.domProcesor,
        i => i.exportInMemoryDocumentsToFiles,
        i => i.waitForUserInput
    ],
    
    
    async: true,
};
