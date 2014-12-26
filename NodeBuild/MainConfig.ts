import Is = require('./Interfaces');
import fsa = require('./FileSystemActions');
import buildConfig = require('./DOMBuildDirectives');
//export module tsp.NodeBuildConfig {
    var htmlFileSelector: Is.IFileSelectorAction = {
        do: fsa.selectFiles,
        fileTest: fsa.testForHtmlFileName,
        rootDirectoryRetriever: fsa.rootDirectoryRetriever,
    };
    var htmlFileProcessor: Is.IFileProcessorAction = {
        do: fsa.processHTMLFile,
        fileSubProcessActions: buildConfig.tsp.htmlFileBuildConfig.buildActions,
        debug: true,
    };
    export var htmlFileBuild: Is.IFileBuildAction = {
        do: fsa.fileBuilder,

        fileSelector: htmlFileSelector,
        fileProcessor: htmlFileProcessor,
    }
//}