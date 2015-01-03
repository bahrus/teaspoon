/*//#region[mode='cs']
module tsp.MainConfig{
    var Is = tsp.Is;
    var fsa = tsp.FileSystemActions;
    var ua = tsp.UtilityActions;
    var domDirectives = tsp.DOMBuildDirectives;
*///#endregion[mode='cs']
//#region[mode='ss']
import Is = require('./Interfaces');
import ua = require('./UtilityActions');
import fsa = require('./FileSystemActions');
import domDirectives = require('./DOMBuildDirectives');
//#endregion[mode='ss']

var versionKey = 'version';
//#region private actions
var versionFileReader: fsa.ITextFileReaderAction = {
    do: fsa.readTextFile,
    rootDirectoryRetriever: fsa.retrieveRootDirectory,
    relativeFilePath: 'Version.txt',
};

var cacheVersionLabel: fsa.ICacheFileContents = {
    do: fsa.cacheTextFile,
    cacheKey: versionKey,
    fileReaderAction: versionFileReader,
};

//#region Html Files
var htmlFileSelector: Is.IFileSelectorAction = {
    do: fsa.selectFiles,
    fileTest: fsa.testForHtmlFileName,
    rootDirectoryRetriever: fsa.retrieveRootDirectory,
};
var htmlFileProcessor: fsa.IFileProcessorAction = {
    do: fsa.processHTMLFile,
    fileSubProcessActions: domDirectives.All,
    //debug: true,
};
var processHTMLFilesInMemory: fsa.ISelectAndProcessFileAction = {
    do: fsa.selectAndProcessFiles,
    fileSelector: htmlFileSelector,
    fileProcessor: htmlFileProcessor,
}
//#endregion
//#region JS Files
var jsNonMinifiedFileSelector: Is.IFileSelectorAction = {
    do: fsa.selectFiles,
    fileTest: fsa.testForNonMinifiedJSFileName,
    rootDirectoryRetriever: fsa.retrieveRootDirectory,
};
var jsFileMinifier: fsa.IFileProcessorAction = {
    do: fsa.minifyJSFile,
    async: true,
}

var minifyJSFiles: fsa.ISelectAndProcessFileAction = {
    do: fsa.selectAndProcessFiles,
    fileSelector: jsNonMinifiedFileSelector,
    fileProcessor: jsFileMinifier,
    async: true,
}

//#endregion
//#endregion
var exportInMemoryDocumentsToFiles: Is.IExportDocumentsToFiles = {
    do: fsa.exportProcessedDocumentsToFiles,
    outputRootDirectoryPath: "OutputTest"
}
var waitForUserInput: fsa.IWaitForUserInput = {
    do: fsa.waitForUserInput,
}
export var MainActions: Is.IActionList = {
    do: ua.doSequenceOfActions,
    subActions: [cacheVersionLabel, minifyJSFiles, processHTMLFilesInMemory, exportInMemoryDocumentsToFiles, waitForUserInput],
    async: true
};

