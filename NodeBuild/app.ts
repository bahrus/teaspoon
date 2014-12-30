import cheerio = require('cheerio');
import Is = require('./Interfaces');
import mainConfig = require('./MainConfig');
import nodeJSWebServerFileHost = require('./NodeJSWebFileManager');
import u = require('./tspUtil');

function showUsage() {
    console.log('Usage: node app.js job:jobName');
    console.log('Where jobName = [htmlFileBuild, minifyFiles]');
}
var context: Is.IWebContext = {
    WebFileManager: new nodeJSWebServerFileHost.NodeJSWebFileManager(),
};
var foundJob = false;
for (var i = 0, n = process.argv.length; i < n; i++) {
    var arg = process.argv[i];
    if (u.startsWith(arg, 'job:')) {
        var jobName = u.replaceStartWith(arg, 'job:', '');
        console.log('Executing ' + jobName);
        switch (jobName) {
            case 'htmlFileBuild':
                foundJob = true;
                var htmlFileBuild = mainConfig.htmlFileBuild;
                htmlFileBuild.do(htmlFileBuild, context);
                break;
            case 'minifyFiles':
                foundJob = true;
                var jsMinifyFileBuild = mainConfig.jsMinifyFileBuild;
                jsMinifyFileBuild.do(jsMinifyFileBuild, context);
                break;
            default:
                showUsage();
        }
    }
}
//if (!foundJob)
{
    showUsage();
    var stdin = process['openStdin']();
    process.stdin['setRawMode']();
    console.log('Press ctrl c to exit');
    stdin.on('keypress', function (chunk, key) {
        process.stdout.write('Get Chunk: ' + chunk + '\n');
        if (key && key.ctrl && key.name == 'c') process.exit();
    });
} 



