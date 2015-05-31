
function ID(value: string){
	const $value = value;
	return (target: Function, propName: string, propDescriptor: PropertyDescriptor) => {
		const symbolPropName = $value;
		Reflect.defineMetadata('tsp_id', symbolPropName, target, propName);
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

function describe(obj: any){
	for(let memberName in obj){
		console.log('member name = ' + memberName);
		let keys = Reflect.getMetadataKeys(obj, memberName);
		for(let i = 0, n = keys.length; i < n; i++){
			const metaKey = keys[i];
			console.log('     key = ' + metaKey + ' value = ' + Reflect.getMetadata(metaKey, obj, memberName));
		}
	}
}

class Employee{
	public static $Name = '$Name';
	@ID(Employee.$Name)
	public get Name() : string{return null;} 
	public set Name(v: string){}
	
}

function MetaData<T>(category: string, value: {[key: string] : T}) {
	const $value = value;
	return function (target: Function) {
		for(var propKey in $value){
			let categoryObj = Reflect.getMetadata(propKey, target);
			if(!categoryObj) categoryObj = {};
			categoryObj[category] = $value[propKey];
			Reflect.defineMetadata(propKey, categoryObj, target);
		}
	}
}

const ColumnDef = 'ColumnDef';

interface IColumnDef{
	width?: number;
}

const ValidationDef = 'ValidationDef';
interface IValidationDef{
	maxLength?: number;
}

@MetaData<IColumnDef>(ColumnDef, {
	[Employee.$Name] : {
		width: 100
	}
})
@MetaData<IValidationDef>(ValidationDef, {
	[Employee.$Name] : {
		maxLength: 10
	}
})
class EmployeeView extends Employee{}

var ev = new EmployeeView();
const evNameMeta = Reflect.getMetadata(Employee.$Name, ev.constructor);
console.log(evNameMeta);

const person1 = new Employee();
describe(person1);
const person2 = new Employee();
//person1.$s[<string><any> Employee.$Name] = 'Bruce'
person1.Name = 'Bruce';
console.log(person1.Name);
//console.log(person2['Name_']);


