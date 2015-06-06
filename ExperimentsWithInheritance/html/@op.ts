///<reference path='../node_modules/reflect-metadata/reflect-metadata.d.ts'/>

module op{
	export const tsp_propIDLookup = 'tsp_propIDLookup';
	
	export function setID(propID: string){
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
	
	export function toProp(fieldID: string){
		return (classPrototype: Function, fieldName: string) =>{
			//debugger;
			let propIDLookup = <{[key: string] : string}> Reflect.getMetadata(tsp_propIDLookup, classPrototype);
			if(!propIDLookup){
				propIDLookup = {};
				Reflect.defineMetadata(tsp_propIDLookup, propIDLookup, classPrototype);
			}
			propIDLookup[fieldID] = fieldName;
			const getter = function(){
				const lu = this['__tsp'];
				if(!lu) return null;
				return lu[fieldID];
			}
			const setter = function(val){
				let lu = this['__tsp'];
				if(!lu){
					lu = [];
					this['__tsp'] = lu;
				}
				lu[fieldID] = val;
			}
			//from http://blog.wolksoftware.com/decorators-metadata-reflection-in-typescript-from-novice-to-expert-part-ii
			if (delete this[fieldName]) {
			    // Create new property with getter and setter
			    Object.defineProperty(classPrototype, fieldName, {
			      get: getter,
			      set: setter,
			      enumerable: true,
			      configurable: true
			    });
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
	
	export function describe2(classPrototype: any){
		debugger;
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
