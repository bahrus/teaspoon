///<reference path='ProgramConfig.ts'/>
//import ca = require('./CommonActions');
//import fsa = require('./FileSystemActions');
require('./ProgramConfig');
//import nji = require('./NodeJSImplementations');

const context: fsa.IWebContext = {
    stringCache: {},
    HTMLOutputs: {},
    fileManager: new nji.NodeJSWebFileManager(),
    processManager: new nji.NodeJSProcessManager(),
};
const callback: ca.ICallback = (err) => {
};
var pc = tsp.ProgramConfig;
pc.programConfig.do(pc.programConfig, context, callback);




