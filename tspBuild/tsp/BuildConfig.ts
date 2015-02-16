

module tsp.BuildConfig {
    if (typeof (global) !== 'undefined') {
        require('./Refs');
        for (var key in global.tsp) {
            if (!tsp[key]) tsp[key] = global.tsp[key];
        }
    }
    var ca = tsp.CommonActions;
    var fsa = tsp.FileSystemActions;
    var da = tsp.DOMActions;
    var dbd = tsp.DOMBuildDirectives;

    interface IProgramConfig extends CommonActions.ITypedActionList<IProgramConfig> {
        cacheVersionLabel?: FileSystemActions.ICacheFileContents;
        minifyJSFiles?: FileSystemActions.ISelectAndProcessFileAction;
        selectAndReadHTMLFiles?: FileSystemActions.ISelectAndReadHTMLFilesAction;
        waitForUserInput?: FileSystemActions.IWaitForUserInput;
        domBuildDirectives?: DOMBuildDirectives.IDOMBuildDirectives;
        domProcessor?: DOMActions.IDOMTransformForEachHTMLFileAction<IProgramConfig, FileSystemActions.IHTMLFile>;
        exportInMemoryDocumentsToFiles?: FileSystemActions.IExportDocumentsToFiles;

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
        selectAndReadHTMLFiles: {
            do: fsa.selectAndProcessFiles,
            fileSelector: {
                do: fsa.selectFiles,
                fileTest: fsa.commonHelperFunctions.testForHtmlFileName,
                rootDirectoryRetriever: fsa.commonHelperFunctions.retrieveWorkingDirectory,
            },
            fileProcessor: {
                do: fsa.storeHTMLFiles,
            },
        },
        domBuildDirectives: dbd.domBuildConfig,

        domProcessor: {
            do: da.ApplyDOMTransformsOnHTMLFiles,
            //htmlFilesGenerator: i => i.selectAndReadHTMLFiles.state.htmlFiles,
            //domTransformsGenerator: i => [i.domBuildDirectives.removeBuildDirective, i.domBuildDirectives.makeJSClobDirective],

            //putHTMLFileIntoDomTransformGenerator: i => {
            //    return {
            //        //do: DOMActions.ApplyDOMTransformsOnHTMLFile,
            //        htmlFiles: i.selectAndReadHTMLFiles.state.htmlFiles,
            //        domTransforms: [i.domBuildDirectives.removeBuildDirective, i.domBuildDirectives.makeJSClobDirective],
            //    }
            //}
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
            i => {
                debugger;
                i.domProcessor.htmlFiles = i.selectAndReadHTMLFiles.state.htmlFiles;
                i.domProcessor.domTransforms = [i.domBuildDirectives.removeBuildDirective, i.domBuildDirectives.makeJSClobDirective];
                return i.domProcessor;
            },
            //i => i.domProcessor,
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
    global[globalNS].BuildConfig = tsp.BuildConfig;
}