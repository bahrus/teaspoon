import Is = require('./Interfaces');
import fsa = require('./FileSystemActions');
import domDirectives = require('./DOMBuildDirectives');

var htmlFileSelector: Is.IFileSelectorAction = {
    do: fsa.selectFiles,
    fileTest: fsa.testForHtmlFileName,
    rootDirectoryRetriever: fsa.rootDirectoryRetriever,
    sync: true,
};
var htmlFileProcessor: Is.IFileProcessorAction = {
    do: fsa.processHTMLFile,
    fileSubProcessActions: domDirectives.All,
    sync: true,
    //debug: true,
};
export var htmlFileBuild: Is.IFileBuildAction = {
    do: fsa.fileBuilder,
    fileSelector: htmlFileSelector,
    fileProcessor: htmlFileProcessor,
    sync: true
}
var jsNonMinifiedFileSelector: Is.IFileSelectorAction = {
    do: fsa.selectFiles,
    fileTest: fsa.testForNonMinifiedJSFileName,
    rootDirectoryRetriever: fsa.rootDirectoryRetriever,
    sync: true,
};
var jsFileMinifier: Is.IFileProcessorAction = {
    do: fsa.minifyJSFile,
    sync: false,
}
export var jsMinifyFileBuild: Is.IFileBuildAction = {
    do: fsa.fileBuilder,
    fileSelector: jsNonMinifiedFileSelector,
    fileProcessor: jsFileMinifier,
    sync: true,
}
