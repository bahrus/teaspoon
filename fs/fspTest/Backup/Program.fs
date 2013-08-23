open System
open System.Collections.Generic
open System.Reflection
open System.Text

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
    

let createTabs n = 
    let sb = new StringBuilder()
    for i = 1 to n do
        sb.Append("\t") |> ignore
    sb.ToString()

let createTypeScriptProperty (prop : PropertyInfo, indent: int) = 
    prop.Name + ": " + getTypeScriptTypeName prop.PropertyType +  "//{get;set;}"

let createTypeScriptInterface (typ : Type, indent: int) = 
    let props = typ.GetProperties()
    let propStrings = props |> Array.map(fun prop -> createTypeScriptProperty (prop, indent + 1))
    let properties = propStrings |> String.concat "\n\r"
    "interface " + typ.Name + "{\n\r" + properties + "\n\r}"

let createTypeScriptInterfaces(typs : Type[], indent: int) = 
    let types = typs |> Array.map(fun typ -> createTypeScriptInterface(typ, indent))
    types |> String.concat "\n\r"

[<EntryPoint>]
let main argv = 
    printfn "%A" argv
    let typ = typeof<tsp.tsp.IDOMBinder>
    let result = createTypeScriptInterface (typ, 0)
    let typs = [| typeof<tsp.tsp.IDOMBinder>; typeof<tsp.tsp.IRenderContext>; typeof<tsp.tsp.IRenderable>; |]
    let result2 = createTypeScriptInterfaces(typs, 0)
    let types2 = typ.Assembly.GetTypes()
    
    //let typ = typeof<tsp.>
    0 // return an integer exit code




