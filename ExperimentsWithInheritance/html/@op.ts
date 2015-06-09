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
	
	export const getter = function(ID: string){
		return function(){
			const lu = this['__@op'];
			if(!lu) return null;
			return lu[ID];
		}
	}
	
	export const setter = function(ID: string){
		return function(val){
			console.log('setting ' + ID);
			let lu = this['__@op'];
			if(!lu){
				lu = [];
				this['__@op'] = lu;
			}
			lu[ID] = val;
		}
	}
	
	export function initProp(){
		return (classPrototype: Function, propName: string, propDescriptor: PropertyDescriptor) => {
			propDescriptor.get = getter(propName);
			propDescriptor.set = setter(propName);
		}
	}
	
	export function toProp(){
		return (classPrototype: Function, fieldName: string) =>{
			console.log('in toProp');
			
			//from http://blog.wolksoftware.com/decorators-metadata-reflection-in-typescript-from-novice-to-expert-part-ii
			if (delete this[fieldName]) {
			    // Create new property with getter and setter
			    Object.defineProperty(classPrototype, fieldName, {
			      get: getter(fieldName),
			      set: setter(fieldName),
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
			plopIntoPropMeta(data, classPrototype, fieldName);
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

	
}
