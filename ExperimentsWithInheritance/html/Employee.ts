
interface IHasStrings{
	$s : {[key: string] : string}; //TODO:  make key a symbol
}

function ID(value: string){
	const $value = value;
//	return function(target: Function, propName: string){
//		debugger;
//	}
	return (target: Function, propName: string, obj: Object) => {
		var symbolPropName = $value;
		debugger;
//		delete target[propName];
		//var p = Object.getPrototypeOf(obj);
		//console.log(target['get'].toString());
		console.log(target['__lookupGetter__']('Name').toString());
//		target['__defineGetter__'](propName, () =>{
//			debugger;
//	        return this._strings[symbolPropName];
//		});
//		Object.defineProperty(target, propName, {
//			__proto__: null,
//	        get: function () {
//				debugger;
//	            return this._strings[symbolPropName];
//	        },
//	        enumerable: true,
//	        configurable: true
//	    });
//		Object.getOwnPropertyDescriptor(target, 'Name').get = () =>{
//			debugger;
//	        return this._strings[symbolPropName];
//		};
		obj['get'] = () =>{
			debugger;
	        return 'iah';
		}
		console.log(Object.getOwnPropertyDescriptor(target, 'Name').get.toString());
	}
}

class Employee implements IHasStrings{
	constructor(){}
	public static $Name = '$Name';
	
	private _strings : {[key: string] : string}; //TODO:  make key a symbol
	
	public get $s(){
		if(!this._strings) this._strings = {};
		return this._strings;
	}
	
	@ID(Employee.$Name)
	public get Name() : string{
		 debugger;
		 return null;
    }
}

function MetaData(value: any) {
  return function (target: Function) {
      //debugger;
  }
}

class EmployeeView implements IHasStrings{
//	@MetaData({
//		[Employee.$Name] : {
//			
//		}
//	})
	public get $s(){return null;} 
	
	
}
debugger;
const person1 = new Employee();
const person2 = new Employee();
person1.$s[<string><any> Employee.$Name] = 'Bruce'
console.log(person1.Name);
//console.log(person2['Name_']);
debugger;


