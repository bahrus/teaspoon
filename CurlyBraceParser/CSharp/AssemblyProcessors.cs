using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Text;

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
                if (typeEx.ProcessorAttribute.SubProcessors != null)
                {
                    
                }
                return typeEx;
            })
            .GroupBy(typeEx => typeEx.OutputNamespace)
            .Select(grp =>
            {
                
                using (new Block("namespace " + grp.Key))
                {
                    grp.ToList().ForEach(typeInfoEx => {
                        Block.AppendBlock(typeInfoEx.OutputContent);
                    });
                    
                }
                return Block.Text;
            });
            //var sbSubProcessorsContent = new StringBuilder();
            var typeSubString = typesEx
                .Where(typeEx => typeEx.ProcessorAttribute.SubProcessors != null)
                .Select(typeEx =>
            {
                
                typeEx.ProcessorAttribute.SubProcessors.ForEach(subprocessor =>
                {
                    subprocessor.Process(typeEx);
                });
                return typeEx.SubProcessorContent;
            });
            var typeAndTypeSubStrings = typeStrings.Union(typeSubString);
            return string.Join("\r\n", typeAndTypeSubStrings.ToArray());
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
            string interfaces = AssemblyProcessorOutput.ProcessToString(assembly, type => type.IsClass && type.GetCustomAttribute <AutoGeneratePropertiesAttribute>() != null);
            var ret = new List<AssemblyProcessorOutput>();
            var interf = new AssemblyProcessorOutput
            {
                FileContent = interfaces,
                FileName = assembly.FullName.SubstringBefore(",") + ".classExtender.cs",
            };
            ret.Add(interf);
            return ret;
        }
    }
    #endregion

    #region Class -> Static Extension Class
    public class AssemblyProcessorToCreateExtensionLibraryFromTypes : IProcessAssembly
    {
        public List<AssemblyProcessorOutput> Process(Assembly assembly)
        {
            string extensionClasses = AssemblyProcessorOutput.ProcessToString(assembly, type => type.IsClass && type.GetCustomAttribute<AutoGenerateExtensionMethodsAttribute>() != null);
            var ret = new List<AssemblyProcessorOutput>();
            var interf = new AssemblyProcessorOutput
            {
                FileContent = extensionClasses,
                FileName = assembly.FullName.SubstringBefore(",") + ".extensionLibs.cs",
            };
            ret.Add(interf);
            return ret;
        }
    }
    #endregion

    #region NamingClass -> NameClass
    public class AssemblyProcessorToCreateNamingClasses : IProcessAssembly
    {
        public List<AssemblyProcessorOutput> Process(Assembly assembly)
        {
            string namingClasses = AssemblyProcessorOutput.ProcessToString(assembly, type => type.IsClass && type.GetCustomAttribute<AutoGenerateNamingClassAttribute>() != null);
            var ret = new List<AssemblyProcessorOutput>();
            var interf = new AssemblyProcessorOutput
            {
                FileContent = namingClasses,
                FileName = assembly.FullName.SubstringBefore(",") + ".extensionLibs.cs",  //".namingClasses.cs",
            };
            ret.Add(interf);
            return ret;
        }
    }
    #endregion
}
