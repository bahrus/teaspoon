import Is = require('./Interfaces');
//import StandardActions = require('./StandardActions'); 
import NodeBuildActions = require('./NodeJSBuildActions');
import buildConfig = require('./buildConfig');
export module tsp.NodeBuildConfig {
    var htmlFileSelector: Is.IFileSelectorAction = {
        do: NodeBuildActions.tsp.NodeBuildActions.selectFiles,
        fileTest: NodeBuildActions.tsp.NodeBuildActions.testForHtmlFileName,
        rootDirectoryRetriever: NodeBuildActions.tsp.NodeBuildActions.rootDirectoryRetriever,
    };
    var htmlFileProcessor: Is.IFileProcessorAction = {
        do: NodeBuildActions.tsp.NodeBuildActions.processHTMLFile,
        fileSubProcessActions: buildConfig.tsp.htmlFileBuildConfig.buildActions,
        debug: true,
    };
    export var htmlFileBuild: Is.IFileBuildAction = {
        do: NodeBuildActions.tsp.NodeBuildActions.fileBuilder,

        fileSelector: htmlFileSelector,
        fileProcessor: htmlFileProcessor,
    }
}