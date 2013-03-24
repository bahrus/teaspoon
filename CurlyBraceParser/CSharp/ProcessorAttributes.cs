﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser.CSharp
{
    #region Assembly Processors
    [AttributeUsage(AttributeTargets.Assembly, Inherited=true)]
    public class BaseAssemblyProcessorAttribute : Attribute
    {
        public Type ProcessorType { get; set; }

        public IProcessAssembly Processor { get; set; }
    }

    [AttributeUsage(AttributeTargets.Assembly, AllowMultiple=true, Inherited=true)]
    public class AssemblyProcessorAttribute : BaseAssemblyProcessorAttribute
    {
        public AssemblyProcessorAttribute()
        {
            this.Processor = new AssemblySubProcessor
            {
                SubProcessors = new List<IProcessAssembly>
                {
                    new AssemblyProcessorToBuildClassFromInterface(),
                    new AssemblyProcessorToExtendClassFromInterface(),
                }
            };
        }
    }

    
    public class AssemblySubProcessor : IProcessAssembly
    {

        public List<IProcessAssembly> SubProcessors { get; set; }

        public List<AssemblyProcessorOutput> Process(Assembly assembly)
        {
            var returnObj = new List<AssemblyProcessorOutput>();
            this.SubProcessors.ForEach(processor => {
                var subOutput = processor.Process(assembly);
                returnObj.AddRange(subOutput);
            });
            return returnObj;
        }
    }
    #endregion

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

    #region Type Processors
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Interface, Inherited=true)]
    public class BaseTypeProcessorAttribute : Attribute
    {
        public Type ProcessorType { get; set; }

        public IProcessType Processor { get; set; }
    }

    [AttributeUsage(AttributeTargets.Interface, Inherited = true)]
    public class AutoGenerateDefaultImplementationAttribute : BaseTypeProcessorAttribute
    {
        public AutoGenerateDefaultImplementationAttribute()
        {
            this.Processor = new DefaultClassImplementor(); 
        }
    }

    [AttributeUsage(AttributeTargets.Class, Inherited = true)]
    public class AutoGeneratePropertiesFromInterfaceAttribute : BaseTypeProcessorAttribute
    {
        public Type InterfaceTypeToImplement { get; set; }

        public AutoGeneratePropertiesFromInterfaceAttribute()
        {
            this.Processor = new PropertiesFromInterfaceImplementor();
        }
    }

    #endregion
}
