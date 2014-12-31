import cheerio = require('cheerio');
import Is = require('./Interfaces');
import programConfig = require('./ProgramConfig');
import nodeJSWebServerFileHost = require('./NodeJSWebFileManager');
import u = require('./tspUtil');

var context: Is.IWebContext = {
    stringCache: {},
    HTMLOutputs: {},
    FileManager: new nodeJSWebServerFileHost.NodeJSWebFileManager(),
};
programConfig.MainActions.do(programConfig.MainActions, context);

var stdin = process['openStdin']();
process.stdin['setRawMode']();
console.log('Press ctrl c to exit');
stdin.on('keypress', function (chunk, key) {
    process.stdout.write('Get Chunk: ' + chunk + '\n');
    if (key && key.ctrl && key.name == 'c') process.exit();
});



