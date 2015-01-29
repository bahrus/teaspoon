
var fs = require('fs');
var path = require('path');
var compressor = require('node-minify');

module tsp.NodeJSImplementations {
    if (typeof (global) !== 'undefined') {
        require('./Refs');
        for (var key in global.tsp) {
            if (!tsp[key]) tsp[key] = global.tsp[key];
        }
    }
    var pa = ParserActions;

    export class NodeJSFileManager implements FileSystemActions.IFileManager {

        readTextFileSync(filePath: string) {
            var data = <any> fs.readFileSync(filePath, { encoding: 'utf8' });
            return <string> data;
        }
        readTextFileAsync(filePath: string, callback: (err: Error, data: string) => void) {
            fs.readFile(filePath, { encoding: 'utf8' }, callback);
        }
        resolve(...pathSegments: any[]) {
            return path.resolve.apply(this, pathSegments);
        }

        listDirectorySync(dirPath: string) {
            return fs.readdirSync(dirPath);
        }
        getExecutingScriptFilePath() {
            var pathOfScript = process.argv[1];
            return pathOfScript;
        }
        getSeparator() {
            return path.sep;
        }
        writeTextFileSync(filePath: string, content: string) {
            fs.writeFileSync(filePath, content, { encoding: 'utf8' });
        }
        getWorkingDirectoryPath() {
            return process.cwd();
        }
    }

    export class NodeJSWebFileManager extends NodeJSFileManager implements FileSystemActions.IWebFileManager {

        loadHTML(html: string) {
            var $ = cheerio.load(html);
            var $any = <any> $;
            return <JQueryStatic> $any;
        }
        minify(filePath: string, callback: (err: Error, min: string) => void) {
            var destPath = pa.replaceEndWith(filePath, '.js', '.min.js');
            new compressor.minify({
                type: 'uglifyjs',
                fileIn: filePath,
                fileOut: destPath,
                callback: callback,
            });
        }

    }

    export class NodeJSProcessManager implements CommonActions.IProcessManager {
        WaitForUserInputAndExit(message: string, testForExit: (chunk: string, key: string) => boolean) {
            var stdin = process['openStdin']();
            process.stdin['setRawMode']();
            console.log(message);
            stdin.on('keypress', function (chunk, key) {
                process.stdout.write('Get Chunk: ' + chunk + '\n');
                if (testForExit(chunk, key)) process.exit();
            });
        }
    }
}

if (typeof (global) !== 'undefined') {
    var guid = 'tsp-81B44259-976C-4DFC-BE00-6E901415FEF3';
    var globalNS = global[guid] || 'tsp';
    if (!global[globalNS]) global[globalNS] = {};
    global[globalNS].NodeJSImplementations = tsp.NodeJSImplementations;
}