interface Options{
    type?: string;
    fileIn?: any;
    fileOut?: string;
    callback: (err: Error, min: string) => void;
    buffer?: number;
    options?: string[];
    tempPath: string;
}


declare module "compressor" {
    export class minify {
        constructor(options: Options);
    }
}