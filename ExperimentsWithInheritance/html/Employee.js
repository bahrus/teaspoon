var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
if (typeof __decorate !== "function") __decorate = function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var tsp_propIDLookup = 'tsp_propIDLookup';
function ID(propID) {
    return function (classPrototype, propName, propDescriptor) {
        //Reflect.defineMetadata('tsp_id', propID, classPrototype, propName);
        var propIDLookup = Reflect.getMetadata(tsp_propIDLookup, classPrototype);
        if (!propIDLookup) {
            propIDLookup = {};
            Reflect.defineMetadata(tsp_propIDLookup, propIDLookup, classPrototype);
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
function FID(fieldID) {
    return function (classPrototype, fieldName) {
        //debugger;
        var propIDLookup = Reflect.getMetadata(tsp_propIDLookup, classPrototype);
        if (!propIDLookup) {
            propIDLookup = {};
            Reflect.defineMetadata(tsp_propIDLookup, propIDLookup, classPrototype);
        }
        propIDLookup[fieldID] = fieldName;
    };
}
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
function describe2(classPrototype) {
    debugger;
}
function MetaData(category, value) {
    return function (target) {
        var targetPrototype = target.prototype;
        var propIDLookup = Reflect.getMetadata(tsp_propIDLookup, targetPrototype);
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
var Employee = (function () {
    function Employee() {
    }
    Object.defineProperty(Employee.prototype, "Surname", {
        get: function () { return null; },
        set: function (v) { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "FirstName", {
        get: function () {
            return this._firstName;
        },
        set: function (val) {
            this._firstName = val;
        },
        enumerable: true,
        configurable: true
    });
    Employee.Surname = '$Surname';
    Employee.MiddleName = '$MiddleName';
    Object.defineProperty(Employee.prototype, "Surname",
        __decorate([
            ID(Employee.Surname)
        ], Employee.prototype, "Surname", Object.getOwnPropertyDescriptor(Employee.prototype, "Surname")));
    __decorate([
        FID(Employee.MiddleName)
    ], Employee.prototype, "MiddleName");
    return Employee;
})();
describe2(Employee.prototype);
var ColumnDef = 'ColumnDef';
var Constraints = 'Constraints';
var EmployeeView = (function (_super) {
    __extends(EmployeeView, _super);
    function EmployeeView() {
        _super.apply(this, arguments);
    }
    EmployeeView = __decorate([
        MetaData(ColumnDef, (_a = {},
            _a[Employee.Surname] = {
                width: 100
            },
            _a[Employee.MiddleName] = {
                width: 200
            },
            _a
        )),
        MetaData(Constraints, (_b = {},
            _b[Employee.Surname] = {
                maxLength: 10
            },
            _b
        ))
    ], EmployeeView);
    return EmployeeView;
    var _a, _b;
})(Employee);
var ev = new EmployeeView();
ev.MiddleName = 'myMiddleName';
var evPropIDLookup = Reflect.getMetadata(tsp_propIDLookup, ev);
console.log('evPropIDLookup = ');
console.log(evPropIDLookup);
var ev1 = new EmployeeView();
var uBound = 1000000;
var t1 = new Date();
for (var i = 0; i < uBound; i++) {
    ev1.Surname = 'name_' + i;
}
var t2 = new Date();
for (var i = 0; i < uBound; i++) {
    ev1.FirstName = 'name_' + i;
}
var t3 = new Date();
for (var i = 0; i < uBound; i++) {
    ev1.MiddleName = 'name_' + i;
}
var t4 = new Date();
console.log('dynamic property: ' + (t2.getTime() - t1.getTime()));
console.log('static property ' + (t3.getTime() - t2.getTime()));
console.log('static field ' + (t4.getTime() - t3.getTime()));
describe(ev);
var person1 = new Employee();
var emPropIDLookup = Reflect.getMetadata(tsp_propIDLookup, person1);
console.log('emPropIDLookup = ');
console.log(emPropIDLookup);
describe(person1);
var person2 = new Employee();
person1.Surname = 'Bruce';
console.log(person1.Surname);
//# sourceMappingURL=Employee.js.map