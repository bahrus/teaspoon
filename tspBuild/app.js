///<reference path='tsp/NodeJSImplementations.ts'/>
var guid2 = 'i am here';
if (typeof (global) !== 'undefined') {
    require('./tsp/Refs');
}
//const ca1 = tsp.CommonActions;
//const pa1 = tsp.ParserActions;
//console.log(pa1.replaceEndWith(ca1.versionKey, 'n', 'x'));
//const array = [1, 2, 3, 4, 5];
//_.each(array, n => console.log(n));
//console.log('iah');
var nji = tsp.NodeJSImplementations;
var ca = tsp.CommonActions;
var bc = tsp.BuildConfig;
var context = {
    stringCache: {},
    HTMLOutputs: {},
    fileManager: new nji.NodeJSWebFileManager(),
    processManager: new nji.NodeJSProcessManager(),
};
var callback = function (err) {
};
bc.programConfig.do(bc.programConfig, context, callback);
//# sourceMappingURL=app.js.map