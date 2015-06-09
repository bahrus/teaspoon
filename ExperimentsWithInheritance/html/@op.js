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
    function setMemberKey(propID) {
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
    op.setMemberKey = setMemberKey;
    function toProp(fieldID) {
        var _this = this;
        return function (classPrototype, fieldName) {
            console.log('in toProp');
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
    function plopIntoMeta(data) {
        return function (classPrototype, fieldName) {
            console.log('in mergeMeta');
            plopIntoPropMeta(data, classPrototype, fieldName);
        };
    }
    op.plopIntoMeta = plopIntoMeta;
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
    function plopIntoProtoPropsMeta(value) {
        return function (target) {
            var targetPrototype = target.prototype;
            var propIDLookup = Reflect.getMetadata(op.$propIDLookup, targetPrototype);
            //let category : string;
            for (var propKey in value) {
                var propName = (propIDLookup && propIDLookup[propKey]) ? propIDLookup[propKey] : propKey;
                var propVal = value[propKey];
                plopIntoPropMeta(propVal, targetPrototype, propName);
            }
        };
    }
    op.plopIntoProtoPropsMeta = plopIntoProtoPropsMeta;
    function bulkPlopIntoPropMeta(value, props) {
        return function (target) {
            var targetPrototype = target.prototype;
            var propIDLookup = Reflect.getMetadata(op.$propIDLookup, targetPrototype);
            for (var i = 0, n = props.length; i < n; i++) {
                var propKey = props[i];
                var propName = (propIDLookup && propIDLookup[propKey]) ? propIDLookup[propKey] : propKey;
                plopIntoPropMeta(value, targetPrototype, propName);
            }
        };
    }
    op.bulkPlopIntoPropMeta = bulkPlopIntoPropMeta;
})(op || (op = {}));
//# sourceMappingURL=@op.js.map