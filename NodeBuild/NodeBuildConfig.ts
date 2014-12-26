import Interfaces = require('./Interfaces');
//import StandardActions = require('./StandardActions'); 
import NodeBuildActions = require('./NodeBuildActions');
import buildConfig = require('./buildConfig');
export module tsp.NodeBuildConfig {
    var htmlFileSelector: Interfaces.tsp.IFileSelectorAction = {
        do: NodeBuildActions.tsp.NodeBuildActions.selectFiles,
        debug: true,
        fileTest: NodeBuildActions.tsp.NodeBuildActions.testForHtmlFileName,
    };
    var htmlFileProcessor: Interfaces.tsp.IFileProcessorAction = {
        do: NodeBuildActions.tsp.NodeBuildActions.processHTMLFile,
        fileSubProcessActions: buildConfig.tsp.htmlFileBuildConfig.buildActions,
    };
    export var htmlFileBuild: Interfaces.tsp.IFileBuildAction = {
        do: NodeBuildActions.tsp.NodeBuildActions.fileBuilder,
        fileSelector: htmlFileSelector,
        fileProcessor: htmlFileProcessor,
    }
}