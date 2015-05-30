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
    //	return function(target: Function, propName: string){
    //		debugger;
    //	}
    return function (target, propName, propDescriptor) {
        var symbolPropName = $value;
        propDescriptor['get'] = function () {
            debugger;
            return this['$s'][symbolPropName];
            //return 'iah';
        };
    };
}
var Employee = (function () {
    function Employee() {
    }
    Object.defineProperty(Employee.prototype, "$s", {
        get: function () {
            if (!this._strings)
                this._strings = {};
            return this._strings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "Name", {
        get: function () {
            debugger;
            return null;
        },
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
function MetaData(value) {
    return function (target) {
        //debugger;
    };
}
var EmployeeView = (function () {
    function EmployeeView() {
    }
    Object.defineProperty(EmployeeView.prototype, "$s", {
        //	@MetaData({
        //		[Employee.$Name] : {
        //			
        //		}
        //	})
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    return EmployeeView;
})();
debugger;
var person1 = new Employee();
var person2 = new Employee();
person1.$s[Employee.$Name] = 'Bruce';
console.log(person1.Name);
//console.log(person2['Name_']);
debugger;
//# sourceMappingURL=Employee.js.map