const tsp_propIDLookup = 'tsp_propIDLookup';

function ID(propID: string){
	//const $value = value;
	return (target: Function, propName: string, propDescriptor: PropertyDescriptor) => {
		//const symbolPropName = value;
		Reflect.defineMetadata('tsp_id', propID, target, propName);
		let propIDLookup = <{[key: string] : string}> Reflect.getMetadata(tsp_propIDLookup, target);
		if(!propIDLookup){
			propIDLookup = {};
			Reflect.defineMetadata(tsp_propIDLookup, propIDLookup, target);
		}
		propIDLookup[propID] = propName;
		propDescriptor.get = function(){
			const lu = this['__tsp'];
			if(!lu) return null;
			return lu[propID];
		}
		propDescriptor.set = function(val){
			let lu = this['__tsp'];
			if(!lu){
				lu = [];
				this['__tsp'] = lu;
			}
			lu[propID] = val;
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

function MetaData<T>(category: string, value: {[key: string] : T}) {
	//const $value = value;
	return function (target: Function) {
		const propIDLookup = <{[key: string] : string}> Reflect.getMetadata(tsp_propIDLookup, target);
		for(var propKey in value){
			const propName = (propIDLookup && propIDLookup[propKey]) ? propIDLookup[propKey] : propKey;
			let categoryObj = Reflect.getMetadata(category, target, propName);
			if(!categoryObj) {
				categoryObj = {};
				Reflect.defineMetadata(category, categoryObj, target, propName);
			}
			categoryObj[category] = value[propKey];
			
		}
	}
}

class Employee{
	public static $Name = '$Name';
	@ID(Employee.$Name)
	public get Name() : string{return null;} 
	public set Name(v: string){}
	
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
	['Name'] : {
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
const evPropIDLookup = Reflect.getMetadata(tsp_propIDLookup, ev);

console.log('evPropIDLookup = ');
console.log(evPropIDLookup);

describe(ev);

const person1 = new Employee();

const emPropIDLookup = Reflect.getMetadata(tsp_propIDLookup, person1);
console.log('emPropIDLookup = ');
console.log(emPropIDLookup);

describe(person1);
const person2 = new Employee();
//person1.$s[<string><any> Employee.$Name] = 'Bruce'
person1.Name = 'Bruce';
console.log(person1.Name);
//console.log(person2['Name_']);


