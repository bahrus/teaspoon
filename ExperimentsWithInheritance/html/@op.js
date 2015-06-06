///<reference path='../node_modules/reflect-metadata/reflect-metadata.d.ts'/>
var op;
(function (op) {
    op.tsp_propIDLookup = 'tsp_propIDLookup';
    function setID(propID) {
        return function (classPrototype, propName, propDescriptor) {
            //Reflect.defineMetadata('tsp_id', propID, classPrototype, propName);
            var propIDLookup = Reflect.getMetadata(op.tsp_propIDLookup, classPrototype);
            if (!propIDLookup) {
                propIDLookup = {};
                Reflect.defineMetadata(op.tsp_propIDLookup, propIDLookup, classPrototype);
            }
            propIDLookup[propID] = propName;
            propDescriptor.get = function () {
                var lu = this['__tsp'];
                if (!lu)
                    return null;
                return lu[propID];
            };
            propDescriptor.set = function (val) {
                var lu = this['__tsp'];
                if (!lu) {
                    lu = [];
                    this['__tsp'] = lu;
                }
                lu[propID] = val;
            };
        };
    }
    op.setID = setID;
    function toProp(fieldID) {
        var _this = this;
        return function (classPrototype, fieldName) {
            //debugger;
            var propIDLookup = Reflect.getMetadata(op.tsp_propIDLookup, classPrototype);
            if (!propIDLookup) {
                propIDLookup = {};
                Reflect.defineMetadata(op.tsp_propIDLookup, propIDLookup, classPrototype);
            }
            propIDLookup[fieldID] = fieldName;
            var getter = function () {
                var lu = this['__tsp'];
                if (!lu)
                    return null;
                return lu[fieldID];
            };
            var setter = function (val) {
                var lu = this['__tsp'];
                if (!lu) {
                    lu = [];
                    this['__tsp'] = lu;
                }
                lu[fieldID] = val;
            };
            //from http://blog.wolksoftware.com/decorators-metadata-reflection-in-typescript-from-novice-to-expert-part-ii
            if (delete _this[fieldName]) {
                // Create new property with getter and setter
                Object.defineProperty(classPrototype, fieldName, {
                    get: getter,
                    set: setter,
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
    function describe2(classPrototype) {
        debugger;
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