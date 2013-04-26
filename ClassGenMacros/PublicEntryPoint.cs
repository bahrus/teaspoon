using System.Collections.Generic;
using System.Reflection;

namespace ClassGenMacros
{
    public static class PublicEntryPoint
    {
        public static List<AssemblyProcessorOutput> ProcessAssemblies(this List<Assembly> Assemblies)
        {
            var returnObj = new List<AssemblyProcessorOutput>();
            foreach (var assembly in Assemblies)
            {
                var processor = assembly.GetCustomAttribute<BaseAssemblyProcessorAttribute>();
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
