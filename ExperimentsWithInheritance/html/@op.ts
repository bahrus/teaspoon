///<reference path='../node_modules/reflect-metadata/reflect-metadata.d.ts'/>
if (!Object['assign']) {
	//from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target, firstSource) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }
        nextSource = Object(nextSource);

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
  });
}

module op{
	export const $propIDLookup = 'propIDLookup';
	//export const propInfo = 'propInfo';
	
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
			let propIDLookup = <{[key: string] : string}> Reflect.getMetadata($propIDLookup, classPrototype);
			if(!propIDLookup){
				propIDLookup = {};
				Reflect.defineMetadata(propIDLookup, propIDLookup, classPrototype);
			}
			propIDLookup[propID] = propName;
			propDescriptor.get = getter(propID);
			propDescriptor.set = setter(propID);
		}
	}
	
	export function toProp(fieldID: string){
		return (classPrototype: Function, fieldName: string) =>{
			//debugger;
			let propIDLookup = <{[key: string] : string}> Reflect.getMetadata($propIDLookup, classPrototype);
			if(!propIDLookup){
				propIDLookup = {};
				Reflect.defineMetadata(propIDLookup, propIDLookup, classPrototype);
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
		inheritedType?: IType;
	}
	
	export interface IPropInfo extends IType{
		propertyDescriptor ?: any;
		metadata?: {[key: string] : any;};
	}
	
	export function reflect(classRef : Function){
		const classPrototype = classRef.prototype;
		return reflectPrototype(classPrototype);
	}
	
	function getPropertyDescriptor(classPrototype: any, memberKey: string){
		while(classPrototype){
			const propertyDescriptor = Object.getOwnPropertyDescriptor(classPrototype, memberKey);
			if(propertyDescriptor) return propertyDescriptor;
			classPrototype = classPrototype.__proto__;
		}
		return null;
		
	}
	
	function reflectPrototype(classPrototype: any){
		let name : string = classPrototype.constructor.toString().substring(9);
		const iPosOfOpenParen = name.indexOf('(');
		name = name.substr(0, iPosOfOpenParen);
		const returnType : IType = {
			name: name
		}
		for(const memberKey in classPrototype){
			const propertyDescriptor = getPropertyDescriptor(classPrototype, memberKey);
			if(propertyDescriptor){
				if(!returnType.Props) returnType.Props = [];
				const propInfo : IPropInfo = {
					name: memberKey,
					propertyDescriptor : propertyDescriptor,
				}
				returnType.Props.push(propInfo);
				
				const metaDataKeys = Reflect.getMetadataKeys(classPrototype, memberKey);
				for(let i = 0, n = metaDataKeys.length; i < n; i++){
					const metaKey = metaDataKeys[i];
					if(!propInfo.metadata) propInfo.metadata = {};
					//debugger;
					propInfo.metadata[metaKey] = Reflect.getMetadata(metaKey, classPrototype, memberKey);
				}
			}
			
		}
		return returnType;
	}
	
	export function MetaData<T>(value: {[key: string] : T}) {
		return function (target: Function) {
			const targetPrototype = target.prototype;
			const propIDLookup = <{[key: string] : string}> Reflect.getMetadata($propIDLookup, targetPrototype);
			let category : string;
			for(var propKey in value){
				const propName = (propIDLookup && propIDLookup[propKey]) ? propIDLookup[propKey] : propKey;
				const propVal = value[propKey];
				if(!category){
					for(const propValKey in propVal){
						category = propValKey;
						break;
					}
				}
				//let categoryObj = Reflect.getMetadata(category, targetPrototype, propName);
				// if(!categoryObj) {
				// 	categoryObj = {};
				// }
				//TODO:  merge
				const newCategoryObj = propVal[category];
				const prevCategoryObj = Reflect.getMetadata(category, targetPrototype, propName);
				if(prevCategoryObj){
					Object['assign'](newCategoryObj, prevCategoryObj);
				}
				Reflect.defineMetadata(category, newCategoryObj, targetPrototype, propName);
			}
		}
	}
}
