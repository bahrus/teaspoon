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
if (typeof __metadata !== "function") __metadata = function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
///<reference path='@op.ts'/>
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
    Employee.Surname = 'Surname';
    Employee.MiddleName = 'MiddleName';
    Object.defineProperty(Employee.prototype, "Surname",
        __decorate([
            op.setID(Employee.Surname), 
            __metadata('design:type', String)
        ], Employee.prototype, "Surname", Object.getOwnPropertyDescriptor(Employee.prototype, "Surname")));
    __decorate([
        op.toProp(Employee.MiddleName, {
            type: String
        }), 
        __metadata('design:type', String)
    ], Employee.prototype, "MiddleName");
    return Employee;
})();
console.log('describe2 => ');
console.log(op.describe2(Employee.prototype));
var ColumnDef = 'ColumnDef';
var Constraints = 'Constraints';
var EmployeeView = (function (_super) {
    __extends(EmployeeView, _super);
    function EmployeeView() {
        _super.apply(this, arguments);
    }
    EmployeeView = __decorate([
        op.MetaData(ColumnDef, (_a = {},
            _a[Employee.Surname] = {
                width: 100
            },
            _a[Employee.MiddleName] = {
                width: 200
            },
            _a
        )),
        op.MetaData(Constraints, (_b = {},
            _b[Employee.Surname] = {
                maxLength: 10
            },
            _b
        )), 
        __metadata('design:paramtypes', [])
    ], EmployeeView);
    return EmployeeView;
    var _a, _b;
})(Employee);
var ev = new EmployeeView();
ev.MiddleName = 'myMiddleName';
var evPropIDLookup = Reflect.getMetadata(op.tsp_propIDLookup, ev);
console.log('evPropIDLookup = ');
console.log(evPropIDLookup);
var ev1 = new EmployeeView();
// const uBound = 1000000;
// const t1 = new Date();
// for(let i = 0; i < uBound; i++){
// 	ev1.Surname = 'name_' + i;
// }
// const t2 = new Date();
// for(let i = 0; i < uBound; i++){
// 	ev1.FirstName = 'name_' + i;
// }
// const t3 = new Date();
// for(let i = 0; i < uBound; i++){
// 	ev1.MiddleName = 'name_' + i;
// }
// const t4 = new Date();
// console.log('dynamic property: ' + (t2.getTime() - t1.getTime()));
// console.log('static property ' + (t3.getTime() - t2.getTime()));
// console.log('static field ' + (t4.getTime() - t3.getTime()));
op.describe(ev);
var person1 = new Employee();
var emPropIDLookup = Reflect.getMetadata(op.tsp_propIDLookup, person1);
console.log('emPropIDLookup = ');
console.log(emPropIDLookup);
op.describe(person1);
var person2 = new Employee();
person1.Surname = 'Bruce';
console.log(person1.Surname);
//# sourceMappingURL=Employee.js.map