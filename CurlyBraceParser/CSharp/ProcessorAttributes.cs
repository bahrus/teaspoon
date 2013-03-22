using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser.CSharp
{
    [AttributeUsage(AttributeTargets.Assembly, Inherited=true)]
    public class BaseProcessorAttribute : Attribute
    {
        public Type ProcessorType { get; set; }

        public IProcessAssembly Processor { get; set; }
    }

    [AttributeUsage(AttributeTargets.Assembly, AllowMultiple=true, Inherited=true)]
    public class AssemblyProcessorAttribute : BaseProcessorAttribute
    {
        public AssemblyProcessorAttribute()
        {
            this.Processor = new AssemblySubProcessor
            {
                SubProcessors = new List<IProcessAssembly>
                {
                    new AssemblyProcessorToBuildClassFromInterface(),
                    new AssemblyProcessorToBuildClassFromInterface(),
                }
            };
        }
    }

    //[AttributeUsage(AttributeTargets.Interface)]
    //public class InterfaceProcessorAttribute : BaseProcessorAttribute
    //{
    //}

    //[AttributeUsage(AttributeTargets.Interface)]
    //public class Interface2DefaultClassAttribute : InterfaceProcessorAttribute
    //{
    //    public Interface2DefaultClassAttribute()
    //    {
    //        this.ProcessorType = typeof(AssemblyProcessorToBuildClassFromInterface);
    //    }
    //}
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

    public static class PublicEntryPoint
    {
        public static List<AssemblyProcessorOutput> ProcessAssemblies(this List<Assembly> Assemblies)
        {
            var returnObj = new List<AssemblyProcessorOutput>();
            foreach (var assembly in Assemblies)
            {
                var processor = assembly.GetCustomAttribute<BaseProcessorAttribute>();
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
