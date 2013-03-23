using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Reflection;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Linq;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CurlyBraceParser.CSharp
{
    public static class ClassExtenderToImplementInterface
    {
        //public static Dictionary<string, string> ImplementingInterfacePartialClasses(this List<Assembly> Assemblies)
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

        //public static string ImplementInterface(this Assembly assembly)
        //{
        //    var typesToImplement =
        //    assembly.GetTypes()
        //    .Where(type => type.GetCustomAttribute<InterfaceImplementedInVersionAttribute>() != null)
        //    .Select(type => new TypeInfoEx
        //    {
        //        TypeToImplement = type.GetCustomAttribute<InterfaceImplementedInVersionAttribute>().InterfaceType,
        //    });
        //    var typeExs = new List<TypeInfoEx>();
        //    #region populate TypeExs
        //    foreach (var type in assembly.GetTypes())
        //    {
        //        var interfaceToImplement = type.GetCustomAttribute<InterfaceImplementedInVersionAttribute>();
        //        if (interfaceToImplement == null) continue;
        //        typeExs.Add(new TypeInfoEx
        //        {
        //            Type = type,
        //            TypeToImplement = interfaceToImplement.InterfaceType,
        //            Props = interfaceToImplement.InterfaceType.GetPublicProperties().Select(prop => new PropertyInfoEx
        //            {
        //                PropertyInfo = prop,
        //                DefaultValue = prop.GetCustomAttribute<DefaultValueAttribute>(),
        //                Required = prop.GetCustomAttribute<RequiredAttribute>(),
        //            }),
        //        });
        //    }
        //    #endregion
        //    var typesEx = typeExs.GroupBy(tEx => tEx.Type.Namespace);
        //    var typeStrings = typesEx.Select(nameSp =>
        //    {

        //        using (new Block("namespace " + nameSp.Key))
        //        {
        //            #region namespace
        //            var types = nameSp.GroupBy(typeEx => typeEx.Type.DeclaringType != null ? typeEx.Type.DeclaringType.Name : string.Empty).ToDictionary(g => g.Key, gs => gs.ToList());

        //            foreach (var nameSpToTypes in types)
        //            {
        //                foreach (var typeInfoEx in nameSpToTypes.Value)
        //                {
        //                    string className = typeInfoEx.Type.Name;
        //                    using (new Block("public partial class " + className + " : " + typeInfoEx.TypeToImplement.FullName.Replace("+", ".")))
        //                    {
        //                        #region public partial class
        //                        var allProperties = typeInfoEx.Props.ToList();
        //                        foreach (var prop in allProperties)
        //                        {
        //                            #region public property
        //                            Block.AppendClosingStatement("public " + prop.PropertyInfo.PropertyType.FullName + " " + prop.PropertyInfo.Name + "{get;set;}");
        //                            #endregion
        //                        }

        //                        #endregion
        //                    }
        //                }
        //            }
        //            #endregion
        //        }
        //        return Block.Text;
        //    });
        //    return string.Join("\r\n", typeStrings.ToArray());
        //}
    }
}
