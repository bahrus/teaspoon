///<reference path='../node_modules/reflect-metadata/reflect-metadata.d.ts'/>
var op;
(function (op) {
    op.tsp_propIDLookup = 'tsp_propIDLookup';
    op.propInfo = 'propInfo';
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
            var propIDLookup = Reflect.getMetadata(op.tsp_propIDLookup, classPrototype);
            if (!propIDLookup) {
                propIDLookup = {};
                Reflect.defineMetadata(op.tsp_propIDLookup, propIDLookup, classPrototype);
            }
            propIDLookup[propID] = propName;
            propDescriptor.get = op.getter(propID);
            propDescriptor.set = op.setter(propID);
        };
    }
    op.setID = setID;
    function toProp(fieldID, propInfo) {
        var _this = this;
        return function (classPrototype, fieldName) {
            //debugger;
            var propIDLookup = Reflect.getMetadata(op.tsp_propIDLookup, classPrototype);
            if (!propIDLookup) {
                propIDLookup = {};
                Reflect.defineMetadata(op.tsp_propIDLookup, propIDLookup, classPrototype);
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
            if (propInfo) {
                Reflect.defineMetadata('propInfo', propInfo, classPrototype, fieldName);
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
    function describe2(classPrototype) {
        var name = classPrototype.constructor.toString().substring(9);
        var iPosOfOpenParen = name.indexOf('(');
        name = name.substr(0, iPosOfOpenParen);
        var returnType = {
            name: name,
        };
        for (var memberKey in classPrototype) {
            var propertyDescriptor = Object.getOwnPropertyDescriptor(classPrototype, memberKey);
            if (propertyDescriptor) {
                if (!returnType.Props)
                    returnType.Props = [];
                var propInfo_1 = {
                    name: memberKey,
                    propertyDescriptor: propertyDescriptor,
                };
                returnType.Props.push(propInfo_1);
                var metaDataKeys = Reflect.getOwnMetadataKeys(classPrototype, memberKey);
                for (var i = 0, n = metaDataKeys.length; i < n; i++) {
                    var metaKey = metaDataKeys[i];
                    if (!propInfo_1.metadata)
                        propInfo_1.metadata = {};
                    //debugger;
                    propInfo_1.metadata[metaKey] = Reflect.getOwnMetadata(metaKey, classPrototype, memberKey);
                }
            }
        }
        return returnType;
    }
    op.describe2 = describe2;
    function MetaData(category, value) {
        return function (target) {
            var targetPrototype = target.prototype;
            var propIDLookup = Reflect.getMetadata(op.tsp_propIDLookup, targetPrototype);
            for (var propKey in value) {
                var propName = (propIDLookup && propIDLookup[propKey]) ? propIDLookup[propKey] : propKey;
                var categoryObj = Reflect.getMetadata(category, targetPrototype, propName);
                if (!categoryObj) {
                    categoryObj = {};
                }
                categoryObj[category] = value[propKey];
                Reflect.defineMetadata(category, categoryObj, targetPrototype, propName);
            }
        };
    }
    op.MetaData = MetaData;
})(op || (op = {}));
//# sourceMappingURL=@op.js.map