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
        //	private _strings : {[key: string] : string}; //TODO:  make key a symbol
        //	
        //	public get $s(){
        //		if(!this._strings) this._strings = {};
        //		return this._strings;
        //	}
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
var person1 = new Employee();
var person2 = new Employee();
//person1.$s[<string><any> Employee.$Name] = 'Bruce'
person1.Name = 'Bruce';
console.log(person1.Name);
//console.log(person2['Name_']);
//# sourceMappingURL=Employee.js.map