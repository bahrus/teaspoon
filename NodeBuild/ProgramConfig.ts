/*//#region[mode='cs']
module tsp.MainConfig{
    var Is = tsp.Is;
    var fsa = tsp.FileSystemActions;
    var ua = tsp.UtilityActions;
    var domDirectives = tsp.DOMBuildDirectives;
*///#endregion[mode='cs']
//#region[mode='ss']
import ca = require('./CommonActions');
import fsa = require('./FileSystemActions');
import domDirectives = require('./DOMBuildDirectives');
//#endregion[mode='ss']

var versionKey = 'version';
//#region private actions
var versionFileReader: fsa.ITextFileReaderAction = {
    do: fsa.readTextFile,
    rootDirectoryRetriever: fsa.commonHelperFunctions.retrieveWorkingDirectory,
    relativeFilePath: 'Version.txt',
};

var cacheVersionLabel: fsa.ICacheFileContents = {
    do: fsa.cacheTextFile,
    cacheKey: versionKey,
    fileReaderAction: versionFileReader,
};

//#region Html Files
var htmlFileSelector: fsa.IFileSelectorAction = {
    do: fsa.selectFiles,
    fileTest: fsa.commonHelperFunctions.testForHtmlFileName,
    rootDirectoryRetriever: fsa.commonHelperFunctions.retrieveWorkingDirectory,
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
    //debug: true,
}
//#endregion
//#region JS Files
var jsNonMinifiedFileSelector: fsa.IFileSelectorAction = {
    do: fsa.selectFiles,
    fileTest: fsa.commonHelperFunctions.testForNonMinifiedJSFileName,
    rootDirectoryRetriever: fsa.commonHelperFunctions.retrieveWorkingDirectory,
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
//var myString = (function () {/*
//   <div id="someId">
//     some content<br />
//     <a href="#someRef">someRefTxt</a>
//    </div>        
//*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

var exportInMemoryDocumentsToFiles: fsa.IExportDocumentsToFiles = {
    do: fsa.exportProcessedDocumentsToFiles,
    outputRootDirectoryPath: 'OutputTest',
    //debug: true,
}
var waitForUserInput: fsa.IWaitForUserInput = {
    do: fsa.waitForUserInput,
    //debug: true,
}
export var MainActions: ca.IActionList = {
    do: ca.doSequenceOfActions,
    subActions: [cacheVersionLabel, minifyJSFiles, processHTMLFilesInMemory, exportInMemoryDocumentsToFiles, waitForUserInput],
    async: true
};

