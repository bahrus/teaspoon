///<reference path='../node_modules/reflect-metadata/reflect-metadata.d.ts'/>

module op{
	export const tsp_propIDLookup = 'tsp_propIDLookup';
	export const propInfo = 'propInfo';
	
	export const getter = function(ID: string){
		return function(){
			const lu = this['__tsp'];
			if(!lu) return null;
			return lu[ID];
		}
	}
	
	export const setter = function(ID: string){
		return function(val){
			let lu = this['__tsp'];
			if(!lu){
				lu = [];
				this['__tsp'] = lu;
			}
			lu[ID] = val;
		}
	}
	
	export function setID(propID: string){
		return (classPrototype: Function, propName: string, propDescriptor: PropertyDescriptor) => {
			//Reflect.defineMetadata('tsp_id', propID, classPrototype, propName);
			let propIDLookup = <{[key: string] : string}> Reflect.getMetadata(tsp_propIDLookup, classPrototype);
			if(!propIDLookup){
				propIDLookup = {};
				Reflect.defineMetadata(tsp_propIDLookup, propIDLookup, classPrototype);
			}
			propIDLookup[propID] = propName;
			propDescriptor.get = getter(propID);
			propDescriptor.set = setter(propID);
		}
	}
	
	export function toProp(fieldID: string, propInfo?: IPropInfo){
		return (classPrototype: Function, fieldName: string) =>{
			//debugger;
			let propIDLookup = <{[key: string] : string}> Reflect.getMetadata(tsp_propIDLookup, classPrototype);
			if(!propIDLookup){
				propIDLookup = {};
				Reflect.defineMetadata(tsp_propIDLookup, propIDLookup, classPrototype);
			}
			propIDLookup[fieldID] = fieldName;
			
			//from http://blog.wolksoftware.com/decorators-metadata-reflection-in-typescript-from-novice-to-expert-part-ii
			if (delete this[fieldName]) {
			    // Create new property with getter and setter
			    Object.defineProperty(classPrototype, fieldName, {
			      get: getter(fieldID),
			      set: setter(fieldID),
			      enumerable: true,
			      configurable: true
			    });
	  		}
		  if(propInfo){
			  Reflect.defineMetadata('propInfo', propInfo, classPrototype, fieldName);
		  }
			
		}
	}
	
	export function describe(obj: any){
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
	
	export interface IType{
		Props?: IPropInfo[];
		name?: string;
		type?: Function;
		
	}
	
	export interface IPropInfo extends IType{
		propertyDescriptor ?: any;
		metadata?: {[key: string] : any;};
	}
	
	export function describe2(classPrototype: any){
		let name : string = classPrototype.constructor.toString().substring(9);
		const iPosOfOpenParen = name.indexOf('(');
		name = name.substr(0, iPosOfOpenParen);
		var returnType : IType = {
			name: name,
		};
		for(const memberKey in classPrototype){
			const propertyDescriptor = Object.getOwnPropertyDescriptor(classPrototype, memberKey);
			if(propertyDescriptor){
				if(!returnType.Props) returnType.Props = [];
				const propInfo : IPropInfo = {
					name: memberKey,
					propertyDescriptor : propertyDescriptor,
				}
				returnType.Props.push(propInfo);
				const metaDataKeys = Reflect.getOwnMetadataKeys(classPrototype, memberKey);
				for(let i = 0, n = metaDataKeys.length; i < n; i++){
					const metaKey = metaDataKeys[i];
					if(!propInfo.metadata) propInfo.metadata = {};
					//debugger;
					propInfo.metadata[metaKey] = Reflect.getOwnMetadata(metaKey, classPrototype, memberKey);
				}
			}
		}
		return returnType;
	}
	
	export function MetaData<T>(category: string, value: {[key: string] : T}) {
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
}
