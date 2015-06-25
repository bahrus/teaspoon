///<reference path='../node_modules/reflect-metadata/reflect-metadata.d.ts'/>
///<reference path='@op.ts'/>
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
var Examples;
(function (Examples) {
    var Address = (function () {
        function Address() {
        }
        Address.New = function (address) {
            var addressImpl = new Address();
            Object['assign'](addressImpl, address);
            return addressImpl;
        };
        __decorate([
            op.toProp, 
            __metadata('design:type', String)
        ], Address.prototype, "Street");
        __decorate([
            op.toProp, 
            __metadata('design:type', String)
        ], Address.prototype, "ZipCode");
        return Address;
    })();
    var Employee = (function () {
        function Employee() {
        }
        Employee.New = function (employee) {
            var employeeImpl = new Employee();
            Object['assign'](employeeImpl, employee);
            return employeeImpl;
        };
        Object.defineProperty(Employee.prototype, "Surname", {
            //public static Surname = 'Surname';
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
        Employee.prototype.DriveHome = function () {
        };
        Employee.HomeAddress = 'HomeAddress';
        Object.defineProperty(Employee.prototype, "Surname",
            __decorate([
                op.initProp, 
                __metadata('design:type', String)
            ], Employee.prototype, "Surname", Object.getOwnPropertyDescriptor(Employee.prototype, "Surname")));
        __decorate([
            op.toProp(),
            op.plopIntoMeta({
                ColumnDef: {
                    hide: true,
                }
            }), 
            __metadata('design:type', String)
        ], Employee.prototype, "MiddleName");
        __decorate([
            op.toProp, 
            __metadata('design:type', Address)
        ], Employee.prototype, "HomeAddress");
        return Employee;
    })();
    Examples.Employee = Employee;
    console.log('reflect Employee => ');
    console.log(op.reflect(Employee));
    var ColumnDef = 'ColumnDef';
    var Constraints = 'Constraints';
    var setTitleToFieldNameUC = function (fieldName) {
        return {
            ColumnDef: {
                title: fieldName.toUpperCase(),
            }
        };
    };
    var EmployeeView = (function (_super) {
        __extends(EmployeeView, _super);
        function EmployeeView() {
            _super.apply(this, arguments);
        }
        __decorate([
            op.plopIntoMeta({
                Constraints: {
                    maxLength: 10
                }
            }),
            op.plopIntoMeta({
                ColumnDef: {
                    width: 200,
                }
            }),
            op.plopperIntoMeta(setTitleToFieldNameUC), 
            __metadata('design:type', String)
        ], EmployeeView.prototype, "MiddleName");
        __decorate([
            op.plopIntoMeta({
                ColumnDef: {
                    width: 100,
                }
            }), 
            __metadata('design:type', String)
        ], EmployeeView.prototype, "Surname");
        return EmployeeView;
    })(Employee);
    console.log('reflect on EmployeeView =>');
    console.log(op.reflect(EmployeeView));
    var ev = new EmployeeView();
    ev.MiddleName = 'myMiddleName';
    //const evPropIDLookup = Reflect.getMetadata(op.tsp_propIDLookup, ev);
    //console.log('evPropIDLookup = ');
    //console.log(evPropIDLookup);
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
    //op.describe(ev);
    var person1 = Employee.New({
        FirstName: 'Bruce',
        MiddleName: 'B',
        Surname: 'Anderson',
        HomeAddress: Address.New({
            Street: '1600 Pennsylvania Ave',
            ZipCode: '90210'
        }),
    });
    //const emPropIDLookup = Reflect.getMetadata(op.tsp_propIDLookup, person1);
    //console.log('emPropIDLookup = ');
    //console.log(emPropIDLookup);
    //op.describe(person1);
    //const person2 = new Employee();
    person1.Surname = 'Bruce';
    console.log(person1.Surname);
    ev1.MiddleName = 'test';
})(Examples || (Examples = {}));
//# sourceMappingURL=Employee.js.map