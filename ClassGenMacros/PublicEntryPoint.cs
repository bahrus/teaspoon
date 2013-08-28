using System.Collections.Generic;
using System.Reflection;

namespace ClassGenMacros
{
    public static class PublicEntryPoint
    {
        public static List<FileContentsGeneratedFromAssembly> ProcessAssemblies(this List<Assembly> Assemblies)
        {
            var returnObj = new List<FileContentsGeneratedFromAssembly>();
            foreach (var assembly in Assemblies)
            {
                var processor = assembly.GetCustAttrib<BaseAssemblyProcessorToFileAttribute>();
                if (processor != null)
                {
                    var processed = processor.Processor.Process(assembly);
                    returnObj.AddRange(processed);
                }
            }
            return returnObj;
        }
    }
}
