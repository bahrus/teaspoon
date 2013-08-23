namespace Autogen

open System
open System.Collections.Generic
open System.Reflection
open System.Linq

module Util =
    let IsNull (x : System.Object) =
        match x with
            |null -> true
            |_ -> false
        
    let ArrayToList (array : 'TItem array) : 'TItem list =
        [
            for i in [0 .. array.Length] do
                yield array.[i]
        ]
    
    let GenericListToList(list: List<'TItem> ) : 'TItem list =
        [
            for i in [0 .. list.Count] do
                yield list.[i]
        ]

    module Reflection =
        let rec GetPublicPropertiesRecursively (typ : Type) =
            if typ.IsInterface then
                //#region Is Interface
                let propertyInfos = List<PropertyInfo>()
                let considered = List<Type>()
                let queue = Queue<Type>()
                considered.Add typ
                queue.Enqueue typ
                while queue.Count > 0 do
                    //#region while que count > 0
                    let subType = queue.Dequeue()
                    let subTypeInterfaces = subType.GetInterfaces()
                    for i in [0 .. subTypeInterfaces.Length - 1] do
                        let subInterface = subTypeInterfaces.[i]
                        if not (considered.Contains subInterface) then
                            considered.Add subInterface
                            queue.Enqueue subInterface
                    let typeProperties = 
                        subType.GetProperties(
                                                BindingFlags.FlattenHierarchy ||| 
                                                BindingFlags.Public ||| 
                                                BindingFlags.Instance)
                    let newPropertyInfos = typeProperties.Where( fun x -> not(propertyInfos.Contains(x)))
                    propertyInfos.InsertRange(0, newPropertyInfos)
                    //#endregion
                GenericListToList propertyInfos
                
                //#endregion
            else
                let props = typ.GetProperties(BindingFlags.FlattenHierarchy ||| BindingFlags.Public ||| BindingFlags.Instance)
                ArrayToList props



