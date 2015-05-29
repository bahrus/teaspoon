
interface IHasStrings{
	$s : {[key: string] : string}; //TODO:  make key a symbol
}

class Employee implements IHasStrings{
	public static $Name = Symbol();
	
	private _strings : {[key: string] : string}; //TODO:  make key a symbol
	
	public get $s(){
		if(!this._strings) this._strings = {};
		return this._strings;
	}
}

class EmployeeView implements IHasStrings{
	@MetaData({
		[Employee.$Name] : {
			
		}
	})
	public get $s(){return null;}
}

let person = new Employee();
person.$s[<string><any> Employee.$Name] = 'Bruce'



