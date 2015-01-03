import fs = require('fs');
import path = require('path');
import ca = require('./CommonActions');
import fsa = require('./FileSystemActions');
import cheerio = require('cheerio');
import pa = require('./ParserActions');
import compressor = require('node-minify');

export class NodeJSFileManager implements fsa.IFileManager {

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
}

export class NodeJSWebFileManager extends NodeJSFileManager implements fsa.IWebFileManager {
    
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