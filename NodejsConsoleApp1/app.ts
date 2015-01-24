///<reference path='testModule.ts'/>

debugger;
if (typeof(global)!=='undefined') {
    var testModule = require('./testModule');
    global['myModule'] = testModule['testModule'];
}

for (var key in testModule) {
    console.log('testModule.' + key + ' = ' + testModule[key]);
}
console.log(myModule.I12);
console.log('iah');