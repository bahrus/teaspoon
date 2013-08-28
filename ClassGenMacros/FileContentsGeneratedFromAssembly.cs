using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;

namespace ClassGenMacros
{
    public interface IProcessAssemblyToFileFragments
    {
        List<FileContentsGeneratedFromAssembly> Process(Assembly assembly);
    }

    public class FileContentsGeneratedFromAssembly
    {
        public string FileName { get; set; }
        public string FileContent { get; set; }

        public static string ProcessToString<TTypeProcessor>(Assembly assembly, Func<Type, bool> TypeTest, string namespaceKeyWord) where TTypeProcessor : BaseTypeProcessorAttribute
        {
            var typesEx = assembly.GetTypes()
                .Where(type => (type.GetCustAttrib<TTypeProcessor>()) != null && TypeTest(type))
                .Select(type => new TypeInfoEx
                {
                    Type = type,
                    Props = type.GetPublicProperties().Select(prop => new PropertyInfoEx
                    {
                        PropertyInfo = prop,
                        DefaultValue = prop.GetCustAttrib<DefaultValueAttribute>(),
                        Required = prop.GetCustAttrib<RequiredAttribute>(),
                        Ignore = prop.GetCustAttrib<DoNotAutoGenerateAttribute>(),
                        PassThrough = prop.GetCustAttrib<PassThroughComponentAttribute>(),
                    }),
                    ProcessorAttribute = type.GetCustAttrib<TTypeProcessor>(),
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

                using (new Block(namespaceKeyWord + " " + grp.Key))
                {
                    grp.ToList().ForEach(typeInfoEx =>
                    {
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

}
