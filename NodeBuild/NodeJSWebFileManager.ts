import fs = require('fs');
import path = require('path');
import Is = require('./Interfaces');
import cheerio = require('cheerio');
import tspUtils = require('./tspUtil');
import compressor = require('node-minify');

export class NodeJSWebFileManager implements Is.IWebFileManager {
    readTextFileSync(filePath: string) {
        var data = <any> fs.readFileSync(filePath, { encoding: 'utf8' });
        return <string> data;
    }
    resolve(...pathSegments: any[]) {
        return path.resolve.apply(this, pathSegments);
    }
    listDirectorySync(dirPath: string) {
        return fs.readdirSync(dirPath);
    }
    loadHTML(html: string) {
        var $ = cheerio.load(html);
        var $any = <any> $;
        return <JQueryStatic> $any;
    }
    minify(filePath: string, callback: (err: Error, min: string) => void) {
        var destPath = tspUtils.replaceEndWith(filePath, '.js', '.min.js');
        new compressor.minify({
            type: 'uglifyjs',
            fileIn: filePath,
            fileOut: destPath,
            callback: callback,
        });
    }
}