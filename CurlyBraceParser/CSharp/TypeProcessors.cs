using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser.CSharp
{
    public interface IProcessType
    {
        void Process(TypeInfoEx typeInfoEx);
    }

    public class DefaultClassImplementor : IProcessType
    {
        public void Process(TypeInfoEx typeInfoEx)
        {
            string declaringTypeName = typeInfoEx.Type.DeclaringType != null ? typeInfoEx.Type.DeclaringType.Name : null;
            string className = typeInfoEx.Type.Name + (declaringTypeName == null ? string.Empty : "_" + declaringTypeName) + "_defaultImpl";
            Block.IncrementLevel();
            using (new Block("public partial class " + className + " : " + typeInfoEx.Type.FullName.Replace("+", ".")))
            {
                #region public partial class
                var allProperties = typeInfoEx.Props.ToList();
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
            Block.DecrementLevel();
            typeInfoEx.OutputNamespace = typeInfoEx.Type.Namespace;
            typeInfoEx.OutputContent = Block.Text;
        }
    }

    public class PropertiesFromInterfaceImplementor : IProcessType
    {
        public void Process(TypeInfoEx typeInfoEx)
        {
            string className = typeInfoEx.Type.Name;
            Block.IncrementLevel();
            var typeToImplement = (typeInfoEx.ProcessorAttribute as AutoGeneratePropertiesFromInterfaceAttribute).InterfaceTypeToImplement;
            using (new Block("public partial class " + className + " : " + typeToImplement.FullName.Replace("+", ".")))
            {
                #region public partial class
                var allProperties = typeInfoEx.Props.ToList();
                foreach (var prop in allProperties)
                {
                    #region public property
                    Block.AppendClosingStatement("public " + prop.PropertyInfo.PropertyType.FullName + " " + prop.PropertyInfo.Name + "{get;set;}");
                    #endregion
                }

                #endregion
            }
            Block.DecrementLevel();
            typeInfoEx.OutputNamespace = typeInfoEx.Type.Namespace;
            typeInfoEx.OutputContent = Block.Text;
        }
    }
}
