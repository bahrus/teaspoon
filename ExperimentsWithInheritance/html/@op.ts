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
	
	export function setMemberKey(propID: string){
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
			console.log('in toProp');
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
	
	function plopIntoPropMeta(propVal: any, targetPrototype: any, propName: string){
		for(const propValKey in propVal){
			const category = propValKey;
			//TODO:  merge
			const newCategoryObj = propVal[category];
			const prevCategoryObj = Reflect.getMetadata(category, targetPrototype, propName);
			if(prevCategoryObj){
				Object['assign'](newCategoryObj, prevCategoryObj);
			}
			Reflect.defineMetadata(category, newCategoryObj, targetPrototype, propName);
		}
	}
	
	export function plopIntoMeta<T>(data: T){
		return (classPrototype: Function, fieldName: string) =>{
			console.log('in mergeMeta');
			plopIntoPropMeta(data, classPrototype, fieldName);
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
	
	export interface IReflectionEntity{
		name: string;
	}
	
	export interface IType extends IReflectionEntity{
		properties?: IPropertyInfo[];
		methods?: IMethodInfo[];
		//type?: Function;
		//inheritedType?: IType;
	}
	
	export interface IMemberInfo extends IReflectionEntity{
		propertyDescriptor ?: any;
		metadata?: {[key: string] : any;};
		isPublic?: boolean;
	}
	
	export interface IPropertyInfo extends IMemberInfo {
		propertyType?:  IType;
	}
	
	export interface IMethodInfo extends IMemberInfo {
		returnType?: IType;
	}
	
	export function reflect(classRef : Function, recursive?: boolean){
		const classPrototype = classRef.prototype;
		return reflectPrototype(classPrototype, recursive);
	}
	
	function getPropertyDescriptor(classPrototype: any, memberKey: string){
		while(classPrototype){
			const propertyDescriptor = Object.getOwnPropertyDescriptor(classPrototype, memberKey);
			if(propertyDescriptor) return propertyDescriptor;
			classPrototype = classPrototype.__proto__;
		}
		return null;
		
	}
	
	function reflectPrototype(classPrototype: any, recursive?: boolean){
		let name : string = classPrototype.constructor.toString().substring(9);
		const iPosOfOpenParen = name.indexOf('(');
		name = name.substr(0, iPosOfOpenParen);
		const returnType : IType = {
			name: name
		}
		for(const memberKey in classPrototype){
			const propertyDescriptor = getPropertyDescriptor(classPrototype, memberKey);
			if(propertyDescriptor){
				const memberInfo : IMemberInfo = {
					name: memberKey,
					propertyDescriptor : propertyDescriptor,
				};
				const metaDataKeys = Reflect.getMetadataKeys(classPrototype, memberKey);
				for(let i = 0, n = metaDataKeys.length; i < n; i++){
					const metaKey = metaDataKeys[i];
					if(!memberInfo.metadata) memberInfo.metadata = {};
					//debugger;
					memberInfo.metadata[metaKey] = Reflect.getMetadata(metaKey, classPrototype, memberKey);
				}
				if(propertyDescriptor.value){
					//#region method
					if(!returnType.methods) returnType.methods = [];
					const methodInfo = <IMethodInfo> memberInfo;
					returnType.methods.push(methodInfo);
					//#endregion
				}else if(propertyDescriptor.get || propertyDescriptor.set){
					//#region property
					if(!returnType.properties) returnType.properties = [];
					const propInfo = <IPropertyInfo> memberInfo;
					returnType.properties.push(propInfo);
					
					
					//#endregion
				}
			}
			
		}
		return returnType;
	}
	
	
	
	export function plopIntoProtoPropsMeta<T>(value: {[key: string] : T}) {
		return function (target: Function) {
			const targetPrototype = target.prototype;
			const propIDLookup = <{[key: string] : string}> Reflect.getMetadata($propIDLookup, targetPrototype);
			//let category : string;
			for(var propKey in value){
				const propName = (propIDLookup && propIDLookup[propKey]) ? propIDLookup[propKey] : propKey;
				const propVal = value[propKey];
				plopIntoPropMeta(propVal, targetPrototype, propName);
			}
		}
	}
	
	export function bulkPlopIntoPropMeta<T>(value: T, props: string[]){
		return function(target: Function){
			const targetPrototype = target.prototype;
			const propIDLookup = <{[key: string] : string}> Reflect.getMetadata($propIDLookup, targetPrototype);
			for(let i = 0, n = props.length; i < n; i++){
				const propKey = props[i];
				const propName = (propIDLookup && propIDLookup[propKey]) ? propIDLookup[propKey] : propKey;
				plopIntoPropMeta(value, targetPrototype, propName);
			}
		}
	}
	
	export interface IComplexPropLinker{
		memberKey: string;
		classRef: Function;
	}
	
	//export function mergeClassProp()
}
