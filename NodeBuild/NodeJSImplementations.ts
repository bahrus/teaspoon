import fs = require('fs');
import path = require('path');
import ca = require('./CommonActions');
import fsa = require('./FileSystemActions');
var cheerio = require('cheerio');
import pa = require('./ParserActions');
import compressor = require('node-minify');

export class NodeJSFileManager implements fsa.IFileManager {

    readTextFileSync(filePath: string) {
        const data = <any> fs.readFileSync(filePath, { encoding: 'utf8' });
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
        const pathOfScript = process.argv[1];
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

export class NodeJSWebFileManager extends NodeJSFileManager implements fsa.IWebFileManager {
    
    loadHTML(html: string) {
        const $ = cheerio.load(html);
        const $any = <any> $;
        return <JQueryStatic> $any;
    }
    minify(filePath: string, callback: (err: Error, min: string) => void) {
        const destPath = pa.replaceEndWith(filePath, '.js', '.min.js');
        new compressor.minify({
            type: 'uglifyjs',
            fileIn: filePath,
            fileOut: destPath,
            callback: callback,
        });
    }
    
}

export class NodeJSProcessManager implements ca.IProcessManager {
    WaitForUserInputAndExit(message: string, testForExit: (chunk: string, key: string) => boolean) {
        const stdin = process['openStdin']();
        process.stdin['setRawMode']();
        console.log(message);
        stdin.on('keypress', function (chunk, key) {
            process.stdout.write('Get Chunk: ' + chunk + '\n');
            if (testForExit(chunk, key)) process.exit();
        });
    }
}