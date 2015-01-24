import ca = require('./CommonActions');
import fsa = require('./FileSystemActions');
import da = require('./DOMActions');
import dbd = require('./DOMBuildDirectives');

module tsp.ProgramConfig {

    

    interface IProgramConfig extends ca.ITypedActionList<IProgramConfig> {
        cacheVersionLabel?: fsa.ICacheFileContents;
        minifyJSFiles?: fsa.ISelectAndProcessFileAction;
        selectAndReadHTMLFiles?: fsa.ISelectAndReadHTMLFilesAction;
        exportInMemoryDocumentsToFiles?: fsa.IExportDocumentsToFiles;
        waitForUserInput?: fsa.IWaitForUserInput;
        //domProcessor?: dbd.domBuildDirectives;
        domBuildDirectives?: dbd.IDOMBuildDirectives;
        //domProcesor?: ca.IDoForEachAction<IProgramConfig, fsa.IHTMLFile>;
        domProcessor?: da.IDOMTransformForEachHTMLFileAction<IProgramConfig, fsa.IHTMLFile>;
        //mergeHTMLFileIntoRemoveDirective?: submergeHTMLFileIntoDomTransformActionState;
        //mergeHTMLFileIntoJSSCobDirective?: submergeHTMLFileIntoDomTransformActionState; 
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

        domProcessor: {
            putHTMLFileIntoDomTransformGenerator: i => {
                return {
                    do: da.ApplyDOMTransformsOnHTMLFiles,
                    htmlFiles: i.selectAndReadHTMLFiles.state.htmlFiles,
                    domTransforms: [i.domBuildDirectives.removeBuildDirective, i.domBuildDirectives.makeJSClobDirective],
                }
            }
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
            i => i.domProcessor,
            i => i.exportInMemoryDocumentsToFiles,
            i => i.waitForUserInput
        ],


        async: true,
    };

}


if (typeof (global) !== 'undefined') {
    var guid = 'tsp-81B44259-976C-4DFC-BE00-6E901415FEF3';
    var globalNS = global[guid] || 'tsp';
    if (!global[globalNS]) global[globalNS] = {};
    global[globalNS].ProgramConfig = tsp.ProgramConfig;
}
