using System.Collections.Generic;
using System.Reflection;

namespace ClassGenMacros
{
    public class TypeScriptAssemblyProcessor : IProcessAssemblyToFileFragments
    {

        public List<FileContentsGeneratedFromAssembly> Process(Assembly assembly)
        {
            return assembly.ToFileContents<AugoGenerateTSTypeDefinitionAttribute>(type => type.IsInterface, "module", ".d.ts");
            
        }
    }
}
