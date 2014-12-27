import fs = require('fs');
import path = require('path');
import Is = require('./Interfaces');

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
}