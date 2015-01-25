module tsp.BuildConfig {

    var ca = CommonActions;

    interface IProgramConfig extends CommonActions.ITypedActionList<IProgramConfig> {
        cacheVersionLabel?: FileSystemActions.ICacheFileContents;
        minifyJSFiles?: FileSystemActions.ISelectAndProcessFileAction;
        selectAndReadHTMLFiles?: FileSystemActions.ISelectAndReadHTMLFilesAction;
        exportInMemoryDocumentsToFiles?: FileSystemActions.IExportDocumentsToFiles;
        waitForUserInput?: FileSystemActions.IWaitForUserInput;
        //domProcessor?: DOMBuildDirectives.domBuildDirectives;
        domBuildDirectives?: DOMBuildDirectives.IDOMBuildDirectives;
        //domProcesor?: ca.IDoForEachAction<IProgramConfig, fsa.IHTMLFile>;
        domProcessor?: DOMActions.IDOMTransformForEachHTMLFileAction<IProgramConfig, FileSystemActions.IHTMLFile>;
        //mergeHTMLFileIntoRemoveDirective?: submergeHTMLFileIntoDomTransformActionState;
        //mergeHTMLFileIntoJSSCobDirective?: submergeHTMLFileIntoDomTransformActionState; 
    }

    var versionKey = 'version';

    export var programConfig: IProgramConfig = {
        do: ca.doSequenceOfTypedActions,
        cacheVersionLabel: {
            do: FileSystemActions.cacheTextFile,
            fileReaderAction: {
                do: FileSystemActions.readTextFile,
                rootDirectoryRetriever: FileSystemActions.commonHelperFunctions.retrieveWorkingDirectory,
                relativeFilePath: 'Version.txt',
            },
            cacheKey: versionKey
        },
        minifyJSFiles: {
            //#region minify JS Files
            do: FileSystemActions.selectAndProcessFiles,
            fileSelector: {
                do: FileSystemActions.selectFiles,
                fileTest: FileSystemActions.commonHelperFunctions.testForNonMinifiedJSFileName,
                rootDirectoryRetriever: FileSystemActions.commonHelperFunctions.retrieveWorkingDirectory,
            },
            fileProcessor: {
                do: FileSystemActions.minifyJSFile,
                async: true,
            },
            async: true,
            //#endregion
        },
        domBuildDirectives: DOMBuildDirectives.domBuildConfig,

        domProcessor: {
            putHTMLFileIntoDomTransformGenerator: i => {
                return {
                    do: DOMActions.ApplyDOMTransformsOnHTMLFiles,
                    htmlFiles: i.selectAndReadHTMLFiles.state.htmlFiles,
                    domTransforms: [i.domBuildDirectives.removeBuildDirective, i.domBuildDirectives.makeJSClobDirective],
                }
            }
        },
        exportInMemoryDocumentsToFiles: {
            do: FileSystemActions.exportProcessedDocumentsToFiles,
            outputRootDirectoryPath: 'OutputTest',
        },
        waitForUserInput: {
            do: FileSystemActions.waitForUserInput,
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