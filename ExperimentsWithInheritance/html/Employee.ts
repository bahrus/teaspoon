
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
		propDescriptor.get = function(){
			return this['$s'][symbolPropName];
		}
		propDescriptor.set = function(val){
			this['$s'][symbolPropName] = val;
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
	public get Name() : string{return null;} 
	public set Name(v: string){}
	
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
const person1 = new Employee();
const person2 = new Employee();
//person1.$s[<string><any> Employee.$Name] = 'Bruce'
person1.Name = 'Bruce';
console.log(person1.Name);
//console.log(person2['Name_']);


