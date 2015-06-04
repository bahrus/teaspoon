const tsp_propIDLookup = 'tsp_propIDLookup';

function ID(propID: string){
	return (classPrototype: Function, propName: string, propDescriptor: PropertyDescriptor) => {
		//Reflect.defineMetadata('tsp_id', propID, classPrototype, propName);
		let propIDLookup = <{[key: string] : string}> Reflect.getMetadata(tsp_propIDLookup, classPrototype);
		if(!propIDLookup){
			propIDLookup = {};
			Reflect.defineMetadata(tsp_propIDLookup, propIDLookup, classPrototype);
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

function FID(fieldID: string){
	return (classPrototype: Function, fieldName: string) =>{
		//debugger;
		let propIDLookup = <{[key: string] : string}> Reflect.getMetadata(tsp_propIDLookup, classPrototype);
		if(!propIDLookup){
			propIDLookup = {};
			Reflect.defineMetadata(tsp_propIDLookup, propIDLookup, classPrototype);
		}
		propIDLookup[fieldID] = fieldName;
	}
}

function describe(obj: any){
	for(let memberName in obj){
		console.log('member name = ' + memberName);
		let keys = Reflect.getMetadataKeys(obj, memberName);
		for(let i = 0, n = keys.length; i < n; i++){
			const metaKey = keys[i];
			console.log('     key = ' + metaKey + ' value = ...');
			console.log(Reflect.getMetadata(metaKey, obj, memberName));
		}
	}
}

function MetaData<T>(category: string, value: {[key: string] : T}) {
	return function (target: Function) {
		const targetPrototype = target.prototype;
		const propIDLookup = <{[key: string] : string}> Reflect.getMetadata(tsp_propIDLookup, targetPrototype);
		for(var propKey in value){
			const propName = (propIDLookup && propIDLookup[propKey]) ? propIDLookup[propKey] : propKey;
			let categoryObj = Reflect.getMetadata(category, targetPrototype, propName);
			if(!categoryObj) {
				categoryObj = {};
			}
			categoryObj[category] = value[propKey];
			Reflect.defineMetadata(category, categoryObj, targetPrototype, propName);
		}
	}
}

class Employee{
	
	public static Surname = '$Surname';
	@ID(Employee.Surname)
	public get Surname() : string{return null;} 
	public set Surname(v: string){}
	
	private _firstName : string;
	
	public get FirstName() : string{
		return this._firstName;
	}
	public set FirstName(val: string){
		this._firstName = val;
	}
	
	public static MidleName = '$MiddleName';
	@FID(Employee.MidleName)
	public MiddleName : string;
}



const ColumnDef = 'ColumnDef';
interface IColumnDef{
	width?: number;
}

const Constraints = 'Constraints';
interface IConstraints{
	maxLength?: number;
}

@MetaData<IColumnDef>(ColumnDef, {
	[Employee.Surname] : {
		width: 100
	}
})
@MetaData<IConstraints>(Constraints, {
	[Employee.Surname] : {
		maxLength: 10
	}
})
class EmployeeView extends Employee{}

var ev = new EmployeeView();
const evPropIDLookup = Reflect.getMetadata(tsp_propIDLookup, ev);

console.log('evPropIDLookup = ');
console.log(evPropIDLookup);

const ev1 = new EmployeeView();

const uBound = 1000000;
const t1 = new Date();
for(let i = 0; i < uBound; i++){
	ev1.Surname = 'name_' + i;
}
const t2 = new Date();
for(let i = 0; i < uBound; i++){
	ev1.FirstName = 'name_' + i;
}
const t3 = new Date();
console.log('dynamic property: ' + (t2.getTime() - t1.getTime()));
console.log('static property ' + (t3.getTime() - t2.getTime()));
describe(ev);

const person1 = new Employee();

const emPropIDLookup = Reflect.getMetadata(tsp_propIDLookup, person1);
console.log('emPropIDLookup = ');
console.log(emPropIDLookup);

describe(person1);
const person2 = new Employee();

person1.Surname = 'Bruce';
console.log(person1.Surname);




