///<reference path='tsp/NodeJSImplementations.ts'/>
const guid2 = 'i am here';
if (typeof (global) !== 'undefined') {
    require('./tsp/Refs');
}
//const ca1 = tsp.CommonActions;
//const pa1 = tsp.ParserActions;
//console.log(pa1.replaceEndWith(ca1.versionKey, 'n', 'x'));
//const array = [1, 2, 3, 4, 5];
//_.each(array, n => console.log(n));
//console.log('iah');
const nji = tsp.NodeJSImplementations;
const ca = tsp.CommonActions;
const bc = tsp.BuildConfig;
const context: tsp.FileSystemActions.IWebContext = {
    stringCache: {},
    HTMLOutputs: {},
    fileManager: new nji.NodeJSWebFileManager(),
    processManager: new nji.NodeJSProcessManager(),
};
const callback: tsp.CommonActions.ICallback = (err) => {
};

bc.programConfig.do(bc.programConfig, context, callback);