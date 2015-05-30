
interface IHasStrings{
	$s : {[key: string] : string}; //TODO:  make key a symbol
}

function ID(value: string){
	const $value = value;
//	return function(target: Function, propName: string){
//		debugger;
//	}
	return (target: Function, propName: string, propDescriptor: PropertyDescriptor) => {
		var symbolPropName = $value;
		propDescriptor['get'] = function(){
			debugger;
			return this['$s'][symbolPropName];
	        //return 'iah';
		}
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


