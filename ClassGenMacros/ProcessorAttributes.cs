﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace ClassGenMacros
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
                    new AssemblyProcessorToCreateExtensionLibraryFromTypes(),
                    new AssemblyProcessorToCreateNamingClasses()
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

    #region Type Processors
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Interface, Inherited=true)]
    public class BaseTypeProcessorAttribute : Attribute
    {
        public Type ProcessorType { get; set; }

        public Type AssociatedType { get; set; }

        public IProcessType Processor { get; set; }

        public List<IProcessType> SubProcessors { get; set; }

        public string ClassImplementorName { get; set; }
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
    public class AutoGeneratePropertiesAttribute : BaseTypeProcessorAttribute
    {
        

        public AutoGeneratePropertiesAttribute()
        {
            this.Processor = new PropertiesFromInterfaceImplementor();
        }
    }

    [AttributeUsage(AttributeTargets.Class, Inherited=true)]
    public class AutoGenerateExtensionMethodsAttribute : BaseTypeProcessorAttribute
    {
        public AutoGenerateExtensionMethodsAttribute()
        {
            this.Processor = new ExtensionMethodsImplementor();
            this.SubProcessors = new List<IProcessType>
            {
                new ExtensionMethodsReferencer(),
            };
        }
    }

    [AttributeUsage(AttributeTargets.Class, Inherited = true)]
    public class AutoGenerateNamingClassAttribute : BaseTypeProcessorAttribute
    {
        public AutoGenerateNamingClassAttribute()
        {
            this.Processor = new AutoGenerateNames();
        }
    }

    #endregion

    #region PropertyAttributes
    [AttributeUsage(AttributeTargets.Property, Inherited=true)]
    public class PassThroughComponentAttribute : Attribute
    {
    }

    public class DoNotAutoGenerateAttribute : Attribute
    {
    }
    #endregion

    
}
