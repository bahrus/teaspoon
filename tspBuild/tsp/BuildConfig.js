var tsp;
(function (tsp) {
    var BuildConfig;
    (function (BuildConfig) {
        try {
            require('./Refs');
            global.refs.moduleTarget = tsp;
        }
        finally { }
        var ca = tsp.CommonActions;
        var fsa = tsp.FileSystemActions;
        var da = tsp.DOMActions;
        var dbd = tsp.DOMBuildDirectives;
        var versionKey = 'version';
        BuildConfig.programConfig = {
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
            },
            selectAndReadHTMLFiles: {
                do: fsa.selectAndProcessFiles,
                //debug: true,
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
            },
            exportInMemoryDocumentsToFiles: {
                do: fsa.exportProcessedDocumentsToFiles,
                outputRootDirectoryPath: 'OutputTest',
            },
            waitForUserInput: {
                do: fsa.waitForUserInput,
            },
            subActionsGenerator: [
                function (i) { return i.cacheVersionLabel; },
                function (i) { return i.minifyJSFiles; },
                function (i) { return i.selectAndReadHTMLFiles; },
                function (i) {
                    i.domProcessor.htmlFiles = i.selectAndReadHTMLFiles.fileProcessor.state.HTMLFiles;
                    i.domProcessor.domTransforms = [i.domBuildDirectives.removeBuildDirective, i.domBuildDirectives.makeJSClobDirective];
                    return i.domProcessor;
                },
                //i => i.domProcessor,
                function (i) { return i.exportInMemoryDocumentsToFiles; },
                function (i) { return i.waitForUserInput; }
            ],
            async: true,
        };
    })(BuildConfig = tsp.BuildConfig || (tsp.BuildConfig = {}));
})(tsp || (tsp = {}));
try {
    global.refs.ref = ['BuildConfig', tsp.BuildConfig];
}
finally { }
//# sourceMappingURL=BuildConfig.js.map