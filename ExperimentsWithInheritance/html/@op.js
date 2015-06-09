///<reference path='../node_modules/reflect-metadata/reflect-metadata.d.ts'/>
if (!Object['assign']) {
    //from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target, firstSource) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }
            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }
                nextSource = Object(nextSource);
                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}
var op;
(function (op) {
    op.getter = function (ID) {
        return function () {
            var lu = this['__@op'];
            if (!lu)
                return null;
            return lu[ID];
        };
    };
    op.setter = function (ID) {
        return function (val) {
            console.log('setting ' + ID);
            var lu = this['__@op'];
            if (!lu) {
                lu = [];
                this['__@op'] = lu;
            }
            lu[ID] = val;
        };
    };
    function initProp() {
        return function (classPrototype, propName, propDescriptor) {
            propDescriptor.get = op.getter(propName);
            propDescriptor.set = op.setter(propName);
        };
    }
    op.initProp = initProp;
    function toProp() {
        var _this = this;
        return function (classPrototype, fieldName) {
            console.log('in toProp');
            //from http://blog.wolksoftware.com/decorators-metadata-reflection-in-typescript-from-novice-to-expert-part-ii
            if (delete _this[fieldName]) {
                // Create new property with getter and setter
                Object.defineProperty(classPrototype, fieldName, {
                    get: op.getter(fieldName),
                    set: op.setter(fieldName),
                    enumerable: true,
                    configurable: true
                });
            }
        };
    }
    op.toProp = toProp;
    function plopIntoPropMeta(propVal, targetPrototype, propName) {
        for (var propValKey in propVal) {
            var category = propValKey;
            //TODO:  merge
            var newCategoryObj = propVal[category];
            var prevCategoryObj = Reflect.getMetadata(category, targetPrototype, propName);
            if (prevCategoryObj) {
                Object['assign'](newCategoryObj, prevCategoryObj);
            }
            Reflect.defineMetadata(category, newCategoryObj, targetPrototype, propName);
        }
    }
    function plopperIntoMeta(fn) {
        return function (classPrototype, fieldName) {
            var data = fn(fieldName);
            plopIntoPropMeta(data, classPrototype, fieldName);
        };
    }
    op.plopperIntoMeta = plopperIntoMeta;
    function plopIntoMeta(data) {
        return function (classPrototype, fieldName) {
            plopIntoPropMeta(data, classPrototype, fieldName);
        };
    }
    op.plopIntoMeta = plopIntoMeta;
    function reflect(classRef, recursive) {
        var classPrototype = classRef.prototype;
        return reflectPrototype(classPrototype, recursive);
    }
    op.reflect = reflect;
    function getPropertyDescriptor(classPrototype, memberKey) {
        while (classPrototype) {
            var propertyDescriptor = Object.getOwnPropertyDescriptor(classPrototype, memberKey);
            if (propertyDescriptor)
                return propertyDescriptor;
            classPrototype = classPrototype.__proto__;
        }
        return null;
    }
    function reflectPrototype(classPrototype, recursive) {
        var name = classPrototype.constructor.toString().substring(9);
        var iPosOfOpenParen = name.indexOf('(');
        name = name.substr(0, iPosOfOpenParen);
        var returnType = {
            name: name
        };
        for (var memberKey in classPrototype) {
            var propertyDescriptor = getPropertyDescriptor(classPrototype, memberKey);
            if (propertyDescriptor) {
                var memberInfo = {
                    name: memberKey,
                    propertyDescriptor: propertyDescriptor,
                };
                var metaDataKeys = Reflect.getMetadataKeys(classPrototype, memberKey);
                for (var i = 0, n = metaDataKeys.length; i < n; i++) {
                    var metaKey = metaDataKeys[i];
                    if (!memberInfo.metadata)
                        memberInfo.metadata = {};
                    //debugger;
                    memberInfo.metadata[metaKey] = Reflect.getMetadata(metaKey, classPrototype, memberKey);
                }
                if (propertyDescriptor.value) {
                    //#region method
                    if (!returnType.methods)
                        returnType.methods = [];
                    var methodInfo = memberInfo;
                    returnType.methods.push(methodInfo);
                }
                else if (propertyDescriptor.get || propertyDescriptor.set) {
                    //#region property
                    if (!returnType.properties)
                        returnType.properties = [];
                    var propInfo = memberInfo;
                    returnType.properties.push(propInfo);
                }
            }
        }
        return returnType;
    }
})(op || (op = {}));
//# sourceMappingURL=@op.js.map