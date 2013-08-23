namespace Autogen

module AssemblyProcessors =
    
    type AssemblyProcessorOutput() =
        [<DefaultValue>] val mutable FileName       : string
        [<DefaultValue>] val mutable FileContent    : string


