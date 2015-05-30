
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
			const lu = this['__tsp'];
			if(!lu) return null;
			return lu[symbolPropName];
		}
		propDescriptor.set = function(val){
			let lu = this['__tsp'];
			if(!lu){
				lu = [];
				this['__tsp'] = lu;
			}
			lu[symbolPropName] = val;
		}
	}
}

class Employee{
	
	public static $Name = '$Name';
	@ID(Employee.$Name)
	public get Name() : string{return null;} 
	public set Name(v: string){}
	
}

function MetaData(value: {[key: string] : Object}) {
  return function (target: Function) {
      //debugger;
  }
}

@MetaData({
	[Employee.$Name] : {
		
	}
})
class EmployeeView extends Employee{}

const person1 = new Employee();
const person2 = new Employee();
//person1.$s[<string><any> Employee.$Name] = 'Bruce'
person1.Name = 'Bruce';
console.log(person1.Name);
//console.log(person2['Name_']);


