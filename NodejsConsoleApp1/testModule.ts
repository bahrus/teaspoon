module myModule {
    export var I12 = 'hello';
}

exports.testModule = myModule;

declare module "testModule" {
    export = myModule;
}

