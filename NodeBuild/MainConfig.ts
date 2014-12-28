import Is = require('./Interfaces');
import fsa = require('./FileSystemActions');
import domDirectives = require('./DOMBuildDirectives');

var htmlFileSelector: Is.IFileSelectorAction = {
    do: fsa.selectFiles,
    fileTest: fsa.testForHtmlFileName,
    rootDirectoryRetriever: fsa.rootDirectoryRetriever,
};
var htmlFileProcessor: Is.IFileProcessorAction = {
    do: fsa.processHTMLFile,
    fileSubProcessActions: domDirectives.All,
    //debug: true,
};
export var htmlFileBuild: Is.IFileBuildAction = {
    do: fsa.fileBuilder,
    fileSelector: htmlFileSelector,
    fileProcessor: htmlFileProcessor,
}
var jsNonMinifiedFileSelector: Is.IFileSelectorAction = {
    do: fsa.selectFiles,
    fileTest: fsa.testForNonMinifiedJSFileName,
    rootDirectoryRetriever: fsa.rootDirectoryRetriever,
};
var jsFileMinifier: Is.IFileProcessorAction = {
    do: fsa.minifyJSFile,
}
export var jsMinifyFileBuild: Is.IFileBuildAction = {
    do: fsa.fileBuilder,
    fileSelector: jsNonMinifiedFileSelector,
    fileProcessor: jsFileMinifier,
    asynchronous: true,
}
