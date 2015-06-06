///<reference path='@op.ts'/>
class Employee{
	
	public static Surname = 'Surname';
	@op.setID(Employee.Surname)
	public get Surname() : string{return null;} 
	public set Surname(v: string){}
	
	private _firstName : string;
	
	public get FirstName() : string{
		return this._firstName;
	}
	public set FirstName(val: string){
		this._firstName = val;
	}
	
	public static MiddleName = 'MiddleName';
	@op.toProp(Employee.MiddleName)
	public MiddleName : string;
}

op.describe2(Employee.prototype);

const ColumnDef = 'ColumnDef';
interface IColumnDef{
	width?: number;
}

const Constraints = 'Constraints';
interface IConstraints{
	maxLength?: number;
}

@op.MetaData<IColumnDef>(ColumnDef, {
	[Employee.Surname] : {
		width: 100
	},
	[Employee.MiddleName] : {
		width: 200
	}
})
@op.MetaData<IConstraints>(Constraints, {
	[Employee.Surname] : {
		maxLength: 10
	}
})

class EmployeeView extends Employee{}

var ev = new EmployeeView();
ev.MiddleName = 'myMiddleName';
const evPropIDLookup = Reflect.getMetadata(op.tsp_propIDLookup, ev);

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
for(let i = 0; i < uBound; i++){
	ev1.MiddleName = 'name_' + i;
}
const t4 = new Date();
console.log('dynamic property: ' + (t2.getTime() - t1.getTime()));
console.log('static property ' + (t3.getTime() - t2.getTime()));
console.log('static field ' + (t4.getTime() - t3.getTime()));
op.describe(ev);

const person1 = new Employee();

const emPropIDLookup = Reflect.getMetadata(op.tsp_propIDLookup, person1);
console.log('emPropIDLookup = ');
console.log(emPropIDLookup);

op.describe(person1);
const person2 = new Employee();

person1.Surname = 'Bruce';
console.log(person1.Surname);




