///<reference path='tsp/NodeJSImplementations.ts'/>
var guid2 = 'i am here';
if (typeof (global) !== 'undefined') {
    require('./tsp/Refs');
}
//var ca1 = tsp.CommonActions;
//var pa1 = tsp.ParserActions;
//console.log(pa1.replaceEndWith(ca1.versionKey, 'n', 'x'));
//var array = [1, 2, 3, 4, 5];
//_.each(array, n => console.log(n));
//console.log('iah');
var nji = tsp.NodeJSImplementations;
var ca = tsp.CommonActions;
var bc = tsp.BuildConfig;
var context: tsp.FileSystemActions.IWebContext = {
    stringCache: {},
    HTMLOutputs: {},
    fileManager: new nji.NodeJSWebFileManager(),
    processManager: new nji.NodeJSProcessManager(),
};
var callback: tsp.CommonActions.ICallback = (err) => {
};

bc.programConfig.do(bc.programConfig, context, callback);