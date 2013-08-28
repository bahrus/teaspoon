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
                var processors = assembly.GetCustAttribs<BaseAssemblyProcessorToFileAttribute>();
                processors.ForEach(processor =>
                {
                    var processed = processor.Processor.Process(assembly);
                    returnObj.AddRange(processed); 
                });
            }
            return returnObj;
        }
    }
}
