using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser.CSharp
{
    public static class ExtensionClassToExtensionMethods
    {
        //public static Dictionary<string, string> GenerateExtensionClasses(this List<Assembly> Assemblies)
        //{
        //    var returnObj = new Dictionary<string, string>();
        //    foreach (var assembly in Assemblies)
        //    {
        //        var generatedCodeAttribute = assembly.GetCustomAttribute<GeneratedCodeAttribute>();
        //        if (generatedCodeAttribute == null) continue;
        //        if (generatedCodeAttribute.Tool != "tsp") continue;
        //        returnObj[assembly.FullName] = assembly.ImplementInterface();
        //    }
        //    return returnObj;
        //}
    }
}
