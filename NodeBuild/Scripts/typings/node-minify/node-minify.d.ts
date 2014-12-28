interface Options{
    type?: string;
    fileIn?: any;
    fileOut?: string;
    callback: (err: Error, min: string) => void;
    buffer?: number;
    options?: string[];
    tempPath?: string;
}


declare module "node-minify" {
    export class minify {
        constructor(options: Options);
    }
}