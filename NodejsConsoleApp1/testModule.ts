module myModule {
    export var I12 = 'hello';
}

if (typeof (global) !== 'undefined') {
    global.myModule = myModule;
}



