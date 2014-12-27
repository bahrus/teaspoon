//from http://stackoverflow.com/questions/280634/endswith-in-javascript
export function endsWith(str: string, suffix: string) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

export function getFilePathFromRelativePath(filePath: string, relUrl: string) {
}