using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Text;
using System.Threading.Tasks;


namespace CurlyBraceParser.CSharp
{
    public static class Interface2ClassBuilder
    {

        public static string ImplementInterface(this Assembly assembly)
        {
            var typesToImplement =
            assembly.GetTypes()
            .Where(type => type.GetCustomAttribute<InterfaceImplementedInVersionAttribute>() != null)
            .Select(type => new TypeInfoEx{
                TypeToImplement = type.GetCustomAttribute<InterfaceImplementedInVersionAttribute>().InterfaceType,
            });
            var typeExs = new List<TypeInfoEx>();
            #region populate TypeExs
            foreach (var type in assembly.GetTypes())
            {
                var interfaceToImplement = type.GetCustomAttribute<InterfaceImplementedInVersionAttribute>();
                if (interfaceToImplement == null) continue;
                typeExs.Add(new TypeInfoEx
                {
                    Type = type,
                    TypeToImplement = interfaceToImplement.InterfaceType,
                    Props = interfaceToImplement.InterfaceType.GetPublicProperties().Select(prop => new PropertyInfoEx{
                        PropertyInfo = prop,
                        DefaultValue = prop.GetCustomAttribute<DefaultValueAttribute>(),
                        Required = prop.GetCustomAttribute<RequiredAttribute>(),
                    }),
                });
            }
            #endregion
            var typesEx = typeExs.GroupBy(tEx => tEx.Type.Namespace);
            var typeStrings = typesEx.Select(nameSp =>
            {
                
                using (new Block("namespace " + nameSp.Key))
                {
                    #region namespace
                    var types = nameSp.GroupBy(typeEx => typeEx.Type.DeclaringType != null ? typeEx.Type.DeclaringType.Name : string.Empty).ToDictionary(g => g.Key, gs => gs.ToList());

                    foreach (var nameSpToTypes in types)
                    {
                        foreach (var typeInfoEx in nameSpToTypes.Value)
                        {
                            string className = typeInfoEx.Type.Name;
                            using (new Block("public partial class " + className + " : " + typeInfoEx.TypeToImplement.FullName.Replace("+", ".")))
                            {
                                #region public partial class
                                var allProperties = typeInfoEx.Props.ToList();
                                //var propertiesWithDefaultValues = new List<PropertyInfoEx>();
                                //var requiredProperties = new List<PropertyInfoEx>();
                                //var optionalPropertiesWithNoDefaultValues = new List<PropertyInfoEx>();
                                foreach (var prop in allProperties)
                                {
                                    #region public property
                                    //var srcProp = typeInfoEx.Type.GetProperty(prop.PropertyInfo.Name);
                                    //if (srcProp != null) continue;
                                    Block.AppendClosingStatement("public " + prop.PropertyInfo.PropertyType.FullName + " " + prop.PropertyInfo.Name + "{get;set;}");
                                    //if (prop.DefaultValue != null)
                                    //{
                                    //    propertiesWithDefaultValues.Add(prop);
                                    //}
                                    //else if (prop.Required != null)
                                    //{
                                    //    requiredProperties.Add(prop);
                                    //}
                                    //else
                                    //{
                                    //    optionalPropertiesWithNoDefaultValues.Add(prop);
                                    //}
                                    #endregion
                                }

                                //var reqParams = requiredProperties.Select(p => p.PropertyInfo.PropertyType.FullName + " " + p.PropertyInfo.Name);
                                //var defParams = propertiesWithDefaultValues.Select(p => p.PropertyInfo.PropertyType.FullName + " " + p.PropertyInfo.Name + " = " +
                                //    p.DefaultValue.Value.ToCharpValue());
                                //var optionalParams = optionalPropertiesWithNoDefaultValues.Select(p => p.PropertyInfo.PropertyType.FullName + " " + p.PropertyInfo.Name + " = " +
                                //    p.PropertyInfo.PropertyType.ToDefaultCSharpValue());
                                //var allParams = reqParams.Union(defParams).Union(optionalParams);
                                //using (new Block("public " + className + "(" + string.Join(", ", allParams.ToArray()) + ")"))
                                //{
                                //    foreach (var prop in allProperties)
                                //    {
                                //        Block.AppendClosingStatement("this." + prop.PropertyInfo.Name + " = " + prop.PropertyInfo.Name + ";");
                                //    }
                                //}
                                #endregion
                            }
                        }
                    }
                    #endregion
                }
                return Block.Text;
            });
            return string.Join("\r\n", typeStrings.ToArray());   
        }

        public static string InterfacesToConstructorClasses(this Assembly assembly)
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
                //#region namespace
                using (new Block("namespace " + grp.Key))
                {
                    #region namespace
                    var types = grp.GroupBy(typeEx => typeEx.Type.DeclaringType.Name).ToDictionary(g => g.Key, gs => gs.ToList());
                    
                    foreach (var typeEx in types)
                    {
                        foreach (var tsss in typeEx.Value)
                        {
                            string className = tsss.Type.Name + "_defaultImpl";
                            using (new Block("public partial class " + className + " : " + typeEx.Key + "." + tsss.Type.Name))
                            {
                                #region public partial class
                                var allProperties = tsss.Props.ToList();
                                var propertiesWithDefaultValues = new List<PropertyInfoEx>();
                                var requiredProperties = new List<PropertyInfoEx>();
                                var optionalPropertiesWithNoDefaultValues = new List<PropertyInfoEx>();
                                foreach (var prop in allProperties)
                                {
                                    #region public property
                                    Block.AppendClosingStatement("public " + prop.PropertyInfo.PropertyType.FullName + " " + prop.PropertyInfo.Name + "{get;set;}");
                                    if (prop.DefaultValue != null)
                                    {
                                        propertiesWithDefaultValues.Add(prop);
                                    }
                                    else if (prop.Required != null)
                                    {
                                        requiredProperties.Add(prop);
                                    }
                                    else
                                    {
                                        optionalPropertiesWithNoDefaultValues.Add(prop);
                                    }
                                    #endregion
                                }
                                    
                                var reqParams = requiredProperties.Select(p => p.PropertyInfo.PropertyType.FullName + " " + p.PropertyInfo.Name);
                                var defParams = propertiesWithDefaultValues.Select(p => p.PropertyInfo.PropertyType.FullName + " " + p.PropertyInfo.Name + " = " +
                                    p.DefaultValue.Value.ToCharpValue());
                                var optionalParams = optionalPropertiesWithNoDefaultValues.Select(p => p.PropertyInfo.PropertyType.FullName + " " + p.PropertyInfo.Name + " = " +
                                    p.PropertyInfo.PropertyType.ToDefaultCSharpValue());
                                var allParams = reqParams.Union(defParams).Union(optionalParams);
                                using (new Block("public " + className + "(" + string.Join(", ", allParams.ToArray()) + ")"))
                                {
                                    foreach (var prop in allProperties)
                                    {
                                        Block.AppendClosingStatement("this." + prop.PropertyInfo.Name + " = " + prop.PropertyInfo.Name + ";");
                                    }
                                }
                                #endregion
                            }
                        }
                    }
                    #endregion
                }
                return Block.Text;
            });
            return string.Join("\r\n", typeStrings.ToArray());      
        }

        public static Dictionary<string, string> ToDefaultImplClasses(this Assembly MyAssembly)
        {
            var assemblies = MyAssembly.GetReferencedAssemblies().ToList();
            var assemblyToClasses = new Dictionary<string, string>();
            assemblies.ToList().ForEach(assemblyName =>
            {
                var assembly = Assembly.Load(assemblyName);
                var generatedCodeAttribute = assembly.GetCustomAttribute<GeneratedCodeAttribute>();
                if (generatedCodeAttribute == null) return;
                if (generatedCodeAttribute.Tool != "tsp") return;
                assemblyToClasses[assemblyName.Name] = assembly.InterfacesToConstructorClasses();
            });
            return assemblyToClasses;
        }

        public static Dictionary<string, string> ToDefaultImplClasses(this List<Assembly> Assemblies)
        {
            var returnObj = new Dictionary<string, string>();
            foreach (var assembly in Assemblies)
            {
                var generatedCodeAttribute = assembly.GetCustomAttribute<GeneratedCodeAttribute>();
                if (generatedCodeAttribute == null) continue;
                if (generatedCodeAttribute.Tool != "tsp") continue;
                returnObj[assembly.FullName] = assembly.InterfacesToConstructorClasses();
            }
            return returnObj;
        }

        public static Dictionary<string, string> ImplementingInterfacePartialClasses(this List<Assembly> Assemblies)
        {
            var returnObj = new Dictionary<string, string>();
            foreach (var assembly in Assemblies)
            {
                var generatedCodeAttribute = assembly.GetCustomAttribute<GeneratedCodeAttribute>();
                if (generatedCodeAttribute == null) continue;
                if (generatedCodeAttribute.Tool != "tsp") continue;
                returnObj[assembly.FullName] = assembly.ImplementInterface();
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
