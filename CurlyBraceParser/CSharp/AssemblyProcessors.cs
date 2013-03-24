using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices.WindowsRuntime;

namespace CurlyBraceParser.CSharp
{

    public interface IProcessAssembly
    {
        List<AssemblyProcessorOutput> Process(Assembly assembly);
    }

    public class AssemblyProcessorOutput
    {
        public string FileName { get; set; }
        public string FileContent { get; set; }

        public static string ProcessToString(Assembly assembly, Func<Type, bool> TypeTest)
        {
            var typesEx = assembly.GetTypes()
                .Where(type => (type.GetCustomAttribute<BaseTypeProcessorAttribute>()) != null && TypeTest(type))
                .Select(type => new TypeInfoEx
                {
                    Type = type,
                    Props = type.GetPublicProperties().Select(prop => new PropertyInfoEx
                    {
                        PropertyInfo = prop,
                        DefaultValue = prop.GetCustomAttribute<DefaultValueAttribute>(),
                        Required = prop.GetCustomAttribute<RequiredAttribute>(),
                    }),
                    ProcessorAttribute = type.GetCustomAttribute<BaseTypeProcessorAttribute>(),
                })
            ;
            var typeStrings = typesEx.Select(typeEx =>
            {
                var processor = typeEx.ProcessorAttribute.Processor ?? Activator.CreateInstance(typeEx.ProcessorAttribute.ProcessorType) as IProcessType;
                processor.Process(typeEx);
                return typeEx;
            })
            .GroupBy(typeEx => typeEx.OutputNamespace)
            .Select(grp =>
            {
                using (new Block("namespace " + grp.Key))
                {
                    grp.ToList().ForEach(typeInfoEx => Block.AppendBlock(typeInfoEx.OutputContent));
                }
                return Block.Text;
            });

            return string.Join("\r\n", typeStrings.ToArray());
        } 
    }

    #region Interface -> Class
    public class AssemblyProcessorToBuildClassFromInterface : IProcessAssembly
    {
        public List<AssemblyProcessorOutput> Process(Assembly assembly)
        {
            string interfaces = AssemblyProcessorOutput.ProcessToString(assembly, type=>type.IsInterface);
            var ret = new List<AssemblyProcessorOutput>();
            var interf = new AssemblyProcessorOutput
            {
                FileContent = interfaces,
                FileName = assembly.FullName.SubstringBefore(",") + ".defaultImpl.cs",
            };
            ret.Add(interf);
            return ret;
        }
    }
    #endregion

    #region Base Class + Interface -> Extended Class
    public class AssemblyProcessorToExtendClassFromInterface : IProcessAssembly
    {
        public List<AssemblyProcessorOutput> Process(Assembly assembly)
        {
            string interfaces = AssemblyProcessorOutput.ProcessToString(assembly, type => type.IsClass);
            var ret = new List<AssemblyProcessorOutput>();
            var interf = new AssemblyProcessorOutput
            {
                FileContent = interfaces,
                FileName = assembly.FullName.SubstringBefore(",") + ".classExtender.cs",
            };
            ret.Add(interf);
            return ret;
            //var typesToImplement =
            //assembly.GetTypes()
            //.Where(type => type.GetCustomAttribute<InterfaceImplementedInVersionAttribute>() != null)
            //.Select(type => new TypeInfoEx
            //{
            //    TypeToImplement = type.GetCustomAttribute<InterfaceImplementedInVersionAttribute>().InterfaceType,
            //});
            //var typeExs = new List<TypeInfoEx>();
            //#region populate TypeExs
            //foreach (var type in assembly.GetTypes())
            //{
            //    var interfaceToImplement = type.GetCustomAttribute<InterfaceImplementedInVersionAttribute>();
            //    if (interfaceToImplement == null) continue;
            //    typeExs.Add(new TypeInfoEx
            //    {
            //        Type = type,
            //        TypeToImplement = interfaceToImplement.InterfaceType,
            //        Props = interfaceToImplement.InterfaceType.GetPublicProperties().Select(prop => new PropertyInfoEx
            //        {
            //            PropertyInfo = prop,
            //            DefaultValue = prop.GetCustomAttribute<DefaultValueAttribute>(),
            //            Required = prop.GetCustomAttribute<RequiredAttribute>(),
            //        }),
            //    });
            //}
            //#endregion
            //var typesEx = typeExs.GroupBy(tEx => tEx.Type.Namespace);
            //#region TypeStrings
            //var typeStrings = typesEx.Select(nameSp =>
            //{

            //    using (new Block("namespace " + nameSp.Key))
            //    {
            //        #region namespace
            //        var types = nameSp.GroupBy(typeEx => typeEx.Type.DeclaringType != null ? typeEx.Type.DeclaringType.Name : string.Empty).ToDictionary(g => g.Key, gs => gs.ToList());

            //        foreach (var nameSpToTypes in types)
            //        {
            //            foreach (var typeInfoEx in nameSpToTypes.Value)
            //            {
            //                string className = typeInfoEx.Type.Name;
            //                using (new Block("public partial class " + className + " : " + typeInfoEx.TypeToImplement.FullName.Replace("+", ".")))
            //                {
            //                    #region public partial class
            //                    var allProperties = typeInfoEx.Props.ToList();
            //                    foreach (var prop in allProperties)
            //                    {
            //                        #region public property
            //                        Block.AppendClosingStatement("public " + prop.PropertyInfo.PropertyType.FullName + " " + prop.PropertyInfo.Name + "{get;set;}");
            //                        #endregion
            //                    }

            //                    #endregion
            //                }
            //            }
            //        }
            //        #endregion
            //    }
            //    return Block.Text;
            //});
            //#endregion
            //#region output
            //var content = string.Join("\r\n", typeStrings.ToArray());
            //var assemblyOutput = new AssemblyProcessorOutput
            //{
            //    FileContent = content,
            //    FileName = assembly.FullName.SubstringBefore(",") + ".implementingClasses.cs",
            //};
            //var returnObj = new List<AssemblyProcessorOutput>
            //{
            //    assemblyOutput,
            //};
            //return returnObj;
            //#endregion
        }
    }
    #endregion


}
