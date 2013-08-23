namespace Autogen
open System
open System.Reflection


type TypeInfoEx(typ : Type) = 
    member x.Props : PropertyInfoEx list = 
        [
            let props = Util.Reflection.GetPublicPropertiesRecursively typ
            for prop in props do
                yield PropertyInfoEx(prop)
        ]
    member x.Type = typ

type InterfaceInfoEx(typ : Type) =
    inherit TypeInfoEx(typ)

type ModuleInfoEx(typ : Type) =
    inherit TypeInfoEx(typ)

type ClassifiedType =
    | Class of TypeInfoEx
    | Interface of InterfaceInfoEx

type AssemblyToOtherLanguesFileOutput() = 
        [<DefaultValue>] val mutable FileName       : string
        [<DefaultValue>] val mutable FileContent    : string

type AssemblyProcessorOutput =
    |OtherLanguages of AssemblyToOtherLanguesFileOutput


    
     
    //[<DefaultValue>] val mutable AssociatedType : Type
   // [<DefaultValue>] val mutable  Props         : IEnumerable<

    

//   public class TypeInfoEx
//    {
//        public Type Type { get; set; }
//
//        public Type AssociatedType { get; set; }
//
//        public IEnumerable<PropertyInfoEx> Props { get; set; }
//
//        //public Type TypeToImplement { get; set; }
//
//        public BaseTypeProcessorAttribute ProcessorAttribute { get; set; }
//
//        public string OutputNamespace { get; set; }
//
//        public string OutputContent { get; set; }
//
//        public string SubProcessorContent { get; set; }
//    }

