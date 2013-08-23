namespace Autogen

open System
module Attribs = 


    [<AttributeUsage(AttributeTargets.Assembly, Inherited=true)>]
    type public BaseAssemblyProcessorAttribute() =
        inherit Attribute()

        [<DefaultValue>] val mutable ProcessorType : Type

    type public DoNotAutoGenerateAttribute() =
        inherit Attribute()

    [<AttributeUsage(AttributeTargets.Property, Inherited=true)>]
    type public PassThroughComponentAttribute() =
        inherit Attribute()