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
    op.$propIDLookup = 'propIDLookup';
    //export const propInfo = 'propInfo';
    op.getter = function (ID) {
        return function () {
            var lu = this['__tsp'];
            if (!lu)
                return null;
            return lu[ID];
        };
    };
    op.setter = function (ID) {
        return function (val) {
            var lu = this['__tsp'];
            if (!lu) {
                lu = [];
                this['__tsp'] = lu;
            }
            lu[ID] = val;
        };
    };
    function setID(propID) {
        return function (classPrototype, propName, propDescriptor) {
            //Reflect.defineMetadata('tsp_id', propID, classPrototype, propName);
            var propIDLookup = Reflect.getMetadata(op.$propIDLookup, classPrototype);
            if (!propIDLookup) {
                propIDLookup = {};
                Reflect.defineMetadata(propIDLookup, propIDLookup, classPrototype);
            }
            propIDLookup[propID] = propName;
            propDescriptor.get = op.getter(propID);
            propDescriptor.set = op.setter(propID);
        };
    }
    op.setID = setID;
    function toProp(fieldID) {
        var _this = this;
        return function (classPrototype, fieldName) {
            //debugger;
            var propIDLookup = Reflect.getMetadata(op.$propIDLookup, classPrototype);
            if (!propIDLookup) {
                propIDLookup = {};
                Reflect.defineMetadata(propIDLookup, propIDLookup, classPrototype);
            }
            propIDLookup[fieldID] = fieldName;
            //from http://blog.wolksoftware.com/decorators-metadata-reflection-in-typescript-from-novice-to-expert-part-ii
            if (delete _this[fieldName]) {
                // Create new property with getter and setter
                Object.defineProperty(classPrototype, fieldName, {
                    get: op.getter(fieldID),
                    set: op.setter(fieldID),
                    enumerable: true,
                    configurable: true
                });
            }
        };
    }
    op.toProp = toProp;
    function describe(obj) {
        for (var memberName in obj) {
            console.log('member name = ' + memberName);
            var keys = Reflect.getMetadataKeys(obj, memberName);
            for (var i = 0, n = keys.length; i < n; i++) {
                var metaKey = keys[i];
                console.log('     key = ' + metaKey + ' value = ...');
                console.log(Reflect.getMetadata(metaKey, obj, memberName));
            }
        }
    }
    op.describe = describe;
    function reflect(classRef) {
        var classPrototype = classRef.prototype;
        return reflectPrototype(classPrototype);
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
    function reflectPrototype(classPrototype) {
        var name = classPrototype.constructor.toString().substring(9);
        var iPosOfOpenParen = name.indexOf('(');
        name = name.substr(0, iPosOfOpenParen);
        var returnType = {
            name: name
        };
        for (var memberKey in classPrototype) {
            var propertyDescriptor = getPropertyDescriptor(classPrototype, memberKey);
            if (propertyDescriptor) {
                if (!returnType.Props)
                    returnType.Props = [];
                var propInfo = {
                    name: memberKey,
                    propertyDescriptor: propertyDescriptor,
                };
                returnType.Props.push(propInfo);
                var metaDataKeys = Reflect.getMetadataKeys(classPrototype, memberKey);
                for (var i = 0, n = metaDataKeys.length; i < n; i++) {
                    var metaKey = metaDataKeys[i];
                    if (!propInfo.metadata)
                        propInfo.metadata = {};
                    //debugger;
                    propInfo.metadata[metaKey] = Reflect.getMetadata(metaKey, classPrototype, memberKey);
                }
            }
        }
        return returnType;
    }
    function MetaData(value) {
        return function (target) {
            var targetPrototype = target.prototype;
            var propIDLookup = Reflect.getMetadata(op.$propIDLookup, targetPrototype);
            var category;
            for (var propKey in value) {
                var propName = (propIDLookup && propIDLookup[propKey]) ? propIDLookup[propKey] : propKey;
                var propVal = value[propKey];
                if (!category) {
                    for (var propValKey in propVal) {
                        category = propValKey;
                        break;
                    }
                }
                //let categoryObj = Reflect.getMetadata(category, targetPrototype, propName);
                // if(!categoryObj) {
                // 	categoryObj = {};
                // }
                //TODO:  merge
                var newCategoryObj = propVal[category];
                var prevCategoryObj = Reflect.getMetadata(category, targetPrototype, propName);
                if (prevCategoryObj) {
                    Object['assign'](newCategoryObj, prevCategoryObj);
                }
                Reflect.defineMetadata(category, newCategoryObj, targetPrototype, propName);
            }
        };
    }
    op.MetaData = MetaData;
})(op || (op = {}));
//# sourceMappingURL=@op.js.map