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
        debugger;
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
        var reflectionTree = {
            name: name,
        };
        debugger;
        for (var memberKey in classPrototype) {
            var member = classPrototype[memberKey];
            if (typeof member === 'object') {
                if (!reflectionTree.Props)
                    reflectionTree.Props = [];
                reflectionTree.Props.push({
                    name: memberKey,
                });
            }
        }
        return reflectionTree;
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