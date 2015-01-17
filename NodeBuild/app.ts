import ca = require('./CommonActions');
import fsa = require('./FileSystemActions');
import programConfig = require('./ProgramConfig');
import nodeJSImplementations = require('./NodeJSImplementations');

const context: fsa.IWebContext = {
    stringCache: {},
    HTMLOutputs: {},
    fileManager: new nodeJSImplementations.NodeJSWebFileManager(),
    processManager: new nodeJSImplementations.NodeJSProcessManager(),
};
const callback: ca.ICallback = (err) => {
};
programConfig.programConfig.do(programConfig.programConfig, context, callback);




