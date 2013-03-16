using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;


namespace CurlyBraceParser.CSharp
{
    public static class Interface2ClassBuilder
    {
        public static string ToConstructorClasses(this Assembly assembly)
        {
            var typesEx =
            assembly.GetTypes()
            .Where(type => type.IsInterface && type.GetCustomAttribute<GeneratedCodeAttribute>() != null)
            .Select(type => new TypeInfoEx
            {
                Type = type,
                Props = type.GetPublicProperties().Select(prop =>
                    new PropertyInfoEx
                    {
                        PropertyInfo = prop,
                        DefaultValue = prop.GetCustomAttribute<DefaultValueAttribute>(),
                        Required = prop.GetCustomAttribute<RequiredAttribute>(),
                    }
                ),
            })
            .GroupBy(tEx => tEx.Type.Namespace);

            
            var typeStrings = typesEx.Select(grp =>
            {
                using (new Block("namespace " + grp.Key))
                {

                    var types = grp.GroupBy(typeEx => typeEx.Type.DeclaringType.Name).ToDictionary(g => g.Key, gs => gs.ToList());
                    
                    foreach (var typeEx in types)
                    {
             //           using (new Block("public static partial class " + typeEx.Key))
                        {
                            foreach (var tsss in typeEx.Value)
                            {
                                string className = tsss.Type.Name + "_defaultImpl";
                                using (new Block("public partial class " + className + " : " + typeEx.Key + "." + tsss.Type.Name))
                                {
                                    var props = tsss.Props.ToList();
                                    var defaults = new List<PropertyInfoEx>();
                                    var requireds = new List<PropertyInfoEx>(); 
                                    foreach (var prop in props)
                                    {
                                        Block.AppendClosingStatement("public " + prop.PropertyInfo.PropertyType.FullName + " " + prop.PropertyInfo.Name + "{get;set;}");
                                        if (prop.DefaultValue != null) defaults.Add(prop);
                                        if (prop.Required != null) requireds.Add(prop);
                                    }
                                    
                                    var reqParams = requireds.Select(p => p.PropertyInfo.PropertyType.FullName + " " + p.PropertyInfo.Name);
                                    var defParams = defaults.Select(p => p.PropertyInfo.PropertyType.FullName + " " + p.PropertyInfo.Name + " = " +
                                        p.DefaultValue.Value.ToCharpValue());
                                    var allParams = reqParams.Union(defParams);
                                    using (new Block("public " + className + "(" + string.Join(", ", allParams.ToArray()) + ")"))
                                    {
                                        foreach (var prop in props)
                                        {
                                            Block.AppendClosingStatement("this." + prop.PropertyInfo.Name + " = " + prop.PropertyInfo.Name + ";");
                                        }
                                    }
                                }
                            }
                        }
                    }
                   
                }
                return Block.Text;
            });
            return string.Join("\r\n", typeStrings.ToArray());      
        }

        public static Dictionary<string, string> ToDefaultImplClasses(this Assembly MyAssembly)
        {
            var assemblies = MyAssembly.GetReferencedAssemblies().ToList();
            var d = new Dictionary<string, string>();
            assemblies.ToList().ForEach(assemblyName =>
            {
                var assembly = Assembly.Load(assemblyName);
                var generatedCodeAttribute = assembly.GetCustomAttribute<GeneratedCodeAttribute>();
                if (generatedCodeAttribute == null) return;
                if (generatedCodeAttribute.Tool != "tsp") return;
                d[assemblyName.Name] = assembly.ToConstructorClasses();
            });
            return d;
        }

        public static Dictionary<string, string> ToDefaultImplClasses(this List<Assembly> Assemblies)
        {
            var returnObj = new Dictionary<string, string>();
            foreach (var assembly in Assemblies)
            {
                var generatedCodeAttribute = assembly.GetCustomAttribute<GeneratedCodeAttribute>();
                if (generatedCodeAttribute == null) continue;
                if (generatedCodeAttribute.Tool != "tsp") continue;
                returnObj[assembly.FullName] = assembly.ToConstructorClasses();
            }
            return returnObj;
        }

        public static PropertyInfo[] GetPublicProperties(this Type type)
        {
            if (type.IsInterface)
            {
                var propertyInfos = new List<PropertyInfo>();

                var considered = new List<Type>();
                var queue = new Queue<Type>();
                considered.Add(type);
                queue.Enqueue(type);
                while (queue.Count > 0)
                {
                    var subType = queue.Dequeue();
                    foreach (var subInterface in subType.GetInterfaces())
                    {
                        if (considered.Contains(subInterface)) continue;

                        considered.Add(subInterface);
                        queue.Enqueue(subInterface);
                    }

                    var typeProperties = subType.GetProperties(
                        BindingFlags.FlattenHierarchy
                        | BindingFlags.Public
                        | BindingFlags.Instance);

                    var newPropertyInfos = typeProperties
                        .Where(x => !propertyInfos.Contains(x));

                    propertyInfos.InsertRange(0, newPropertyInfos);
                }

                return propertyInfos.ToArray();
            }

            return type.GetProperties(BindingFlags.FlattenHierarchy
                | BindingFlags.Public | BindingFlags.Instance);
        }
        
    }

    
}
