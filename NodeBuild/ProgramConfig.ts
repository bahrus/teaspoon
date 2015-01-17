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
import da = require('./DOMActions');
import dbd = require('./DOMBuildDirectives');
//#endregion[mode='ss']



interface IProgramConfig extends ca.ITypedActionList<IProgramConfig> {
    cacheVersionLabel?: fsa.ICacheFileContents;
    minifyJSFiles?: fsa.ISelectAndProcessFileAction;
    selectAndReadHTMLFiles?: fsa.ISelectAndReadHTMLFilesAction;
    exportInMemoryDocumentsToFiles?: fsa.IExportDocumentsToFiles;
    waitForUserInput?: fsa.IWaitForUserInput;
    //domProcessor?: dbd.domBuildDirectives;
    domBuildDirectives?: dbd.IDOMBuildDirectives;
    //domProcesor?: ca.IDoForEachAction<IProgramConfig, fsa.IHTMLFile>;
    domProcessor?: da.IMergeAndDoForEachHTMLFileAction<IProgramConfig, fsa.IHTMLFile>;
    //mergeHTMLFileIntoRemoveDirective?: submergeHTMLFileIntoDomTransformActionState;
    //mergeHTMLFileIntoJSSCobDirective?: submergeHTMLFileIntoDomTransformActionState; 
}

const versionKey = 'version';

export const programConfig: IProgramConfig = {
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
    domBuildDirectives: dbd.domBuildConfig,
    
    domProcessor: {
        forEach: i => i.selectAndReadHTMLFiles.state.htmlFiles,
        //submergeActionGenerator: i => [
        //],
        //submergeActionGenerator: i => [],
        //subActionsGenerator: i => [
        //    htmlFile => {
        //        const directive = i.domBuildDirectives.removeBuildDirective;
        //        directive.state.$ = htmlFile.$;
        //        return directive;
        //    },
        //    htmlFile => {
        //        const directive = i.domBuildDirectives.makeJSClobDirective;
        //        directive.state.$ = htmlFile.$;
        //        return directive;
        //    },
        //],
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
        i => i.domProcessor,
        i => i.exportInMemoryDocumentsToFiles,
        i => i.waitForUserInput
    ],
    
    
    async: true,
};

type SubmergeGetter = (ipg: IProgramConfig) => da.ISubmergeHTMLFileIntoDomTransformActionState;

var mergeAction: da.IMergeAndDoForEachHTMLFileAction<IProgramConfig, fsa.IHTMLFile> = {
    forEach: i => i.selectAndReadHTMLFiles.state.htmlFiles,
    //submergeActionGenerator: [subMergeActionGenerator],
    submergeActionGenerator: [(ipg) => {
        //const returnObj: SubmergeGetter = (ipg) => {
        return (ipg2) => {
            const returnObj: da.ISubmergeHTMLFileIntoDomTransformActionState = {
                destRefs: [ipg2.domBuildDirectives.removeBuildDirective, ipg2.domBuildDirectives.makeJSClobDirective],
                destinationPropertyGetter: i => i.state,
                srcRefs: ipg2.selectAndReadHTMLFiles.state.htmlFiles,
                //sourcePropertyGetter: i => i,
            };
            return returnObj;
        };
        //return returnObj;
    }],
};
programConfig.domProcessor = mergeAction;


