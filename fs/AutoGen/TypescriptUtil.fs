namespace Autogen

open System
open CurlyBraceSyntax

module TypescriptUtil = 

    let rec getTypeScriptTypeNameForGeneric(typ: Type) : string = 
        match typ with
        | _ when  typ.Name = "Dictionary`2" -> "{ [name: string]: " + getTypeScriptTypeName(typ.GetGenericArguments().[1])  + "; }"
        | _ -> "unknown"

    and getTypeScriptTypeName (typ: Type) : string =
        match typ with
        | _ when typ = typeof<string>   -> "string"
        | _ when typ = typeof<int>      -> "number"
        | _ when typ = typeof<float>    -> "number"
        | _ when typ = typeof<bool>     -> "boolean"
        | _ when typ.IsGenericType      -> getTypeScriptTypeNameForGeneric(typ)
        | _ -> typ.FullName


    let CreateTypescriptAssemblyOutputElementFromInterface (interfaceEx : InterfaceInfoEx) =
    
        let interf : OpenStatement = 
            OS ("interface " + interfaceEx.Type.Name) "{"
                [
                    let props = interfaceEx.Props
                    for prop in props do
                        yield Line( prop.PropertyInfo.Name + ": " + getTypeScriptTypeName prop.PropertyInfo.PropertyType ) 
                ] "" 

        ()
    



