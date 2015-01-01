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
var versionFileReader: Is.ITextFileReaderAction = {
    do: fsa.readTextFile,
    rootDirectoryRetriever: fsa.retrieveRootDirectory,
    relativeFilePath: 'Version.txt',
};

var cacheVersion: Is.ICacheFileContents = {
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
var htmlFileProcessor: Is.IFileProcessorAction = {
    do: fsa.processHTMLFile,
    fileSubProcessActions: domDirectives.All,
    //debug: true,
};
var processHTMLFilesInMemory: Is.ISelectAndProcessFileAction = {
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
var jsFileMinifier: Is.IFileProcessorAction = {
    do: fsa.minifyJSFile,
    async: true,
}

var minifyJSFiles: Is.ISelectAndProcessFileAction = {
    do: fsa.selectAndProcessFiles,
    fileSelector: jsNonMinifiedFileSelector,
    fileProcessor: jsFileMinifier,
    async: true,
}
//#endregion
//#endregion
var exportToFiles: Is.IExportDocumentsToFiles = {
    do: fsa.exportProcessedDocumentsToFiles
}
var waitForUserInput: Is.IWaitForUserInput = {
    do: fsa.waitForUserInput,
}
export var MainActions: Is.IActionList = {
    do: ua.doSequenceOfActions,
    subActions: [cacheVersion, minifyJSFiles, processHTMLFilesInMemory, exportToFiles, waitForUserInput],
    async: true
};

