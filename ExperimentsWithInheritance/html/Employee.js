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
function ID(value) {
    var $value = value;
    return function (target, propName, propDescriptor) {
        var symbolPropName = $value;
        propDescriptor.get = function () {
            var lu = this['__tsp'];
            if (!lu)
                return null;
            return lu[symbolPropName];
        };
        propDescriptor.set = function (val) {
            var lu = this['__tsp'];
            if (!lu) {
                lu = [];
                this['__tsp'] = lu;
            }
            lu[symbolPropName] = val;
        };
    };
}
var Employee = (function () {
    function Employee() {
    }
    Object.defineProperty(Employee.prototype, "Name", {
        get: function () { return null; },
        set: function (v) { },
        enumerable: true,
        configurable: true
    });
    Employee.$Name = '$Name';
    Object.defineProperty(Employee.prototype, "Name",
        __decorate([
            ID(Employee.$Name)
        ], Employee.prototype, "Name", Object.getOwnPropertyDescriptor(Employee.prototype, "Name")));
    return Employee;
})();
function MetaData(category, value) {
    var $value = value;
    return function (target) {
        for (var propKey in $value) {
            var categoryObj = Reflect.getMetadata(propKey, target);
            if (!categoryObj)
                categoryObj = {};
            categoryObj[category] = $value[propKey];
            Reflect.defineMetadata(propKey, categoryObj, target);
        }
    };
}
var ColumnDef = 'ColumnDef';
var ValidationDef = 'ValidationDef';
var EmployeeView = (function (_super) {
    __extends(EmployeeView, _super);
    function EmployeeView() {
        _super.apply(this, arguments);
    }
    EmployeeView = __decorate([
        MetaData(ColumnDef, (_a = {},
            _a[Employee.$Name] = {
                width: 100
            },
            _a
        )),
        MetaData(ValidationDef, (_b = {},
            _b[Employee.$Name] = {
                maxLength: 10
            },
            _b
        ))
    ], EmployeeView);
    return EmployeeView;
    var _a, _b;
})(Employee);
var ev = new EmployeeView();
var evNameMeta = Reflect.getMetadata(Employee.$Name, ev.constructor);
console.log(evNameMeta);
var person1 = new Employee();
var person2 = new Employee();
//person1.$s[<string><any> Employee.$Name] = 'Bruce'
person1.Name = 'Bruce';
console.log(person1.Name);
//console.log(person2['Name_']);
//# sourceMappingURL=Employee.js.map