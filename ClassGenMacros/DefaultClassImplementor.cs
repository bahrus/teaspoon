using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Reflection;

namespace ClassGenMacros
{
    public class DefaultClassImplementor : IProcessType
    {
        public void Process(TypeInfoEx typeInfoEx)
        {
            string declaringTypeName = typeInfoEx.Type.DeclaringType != null ? typeInfoEx.Type.DeclaringType.Name : null;
            string originalInterfaceName = typeInfoEx.Type.Name;
            bool isStandardInterfaceName = originalInterfaceName.StartsWith("I")
                && originalInterfaceName.Length > 1
                && originalInterfaceName.Substring(1, 1) == originalInterfaceName.Substring(1, 1).ToUpper();
            string shortClassName = isStandardInterfaceName ? originalInterfaceName.Substring(1) : originalInterfaceName;
            string className = typeInfoEx.ProcessorAttribute.ClassImplementorName ??
                shortClassName + (declaringTypeName == null ?
                    string.Empty : "_" + declaringTypeName);
            if (!isStandardInterfaceName) className += "_defaultImpl";
            Block.IncrementLevel();
            using (new Block("public partial class " + className + " : " + typeInfoEx.Type.FullQName(typeInfoEx.Type.Namespace)))
            {
                #region look for pass throughs

                var passThroughs = typeInfoEx.Props.Where(prop => prop.PropertyInfo.GetCustomAttribute<PassThroughComponentAttribute>() != null);
                var passThroughLookup = new Dictionary<string, PassThroughInfo>();
                passThroughs.ToList().ForEach(propInfoEx =>
                {
                    var passThroughProps = propInfoEx.PropertyInfo.PropertyType.GetPublicProperties();
                    foreach (var passThroughProp in passThroughProps)
                    {
                        passThroughLookup[passThroughProp.Name] = new PassThroughInfo
                        {
                           ComponentPassThroughProperty = propInfoEx.PropertyInfo.Name,
                           SubPropertyTypeString = passThroughProp.PropertyType.FullName,
                        };
                    }
                });
                #endregion
                #region public partial class
                var allProperties = typeInfoEx.Props.ToList();
                var propertiesWithDefaultValues = new List<PropertyInfoEx>();
                var requiredProperties = new List<PropertyInfoEx>();
                var optionalPropertiesWithNoDefaultValues = new List<PropertyInfoEx>();
                var optionalOrRequiredProperties = new List<PropertyInfoEx>();
                foreach (var kvp in passThroughLookup)
                {
                    using (new Block("public " + kvp.Value.SubPropertyTypeString + " " + kvp.Key))
                    {
                        Block.AppendClosingStatement("get {return this." + kvp.Value.ComponentPassThroughProperty + "." + kvp.Key + ";}");
                        Block.AppendClosingStatement("set{this." + kvp.Value.ComponentPassThroughProperty + "." + kvp.Key + " = this." + kvp.Value.ComponentPassThroughProperty + "." + kvp.Key + ";}");
                    }
                }
                foreach (var prop in allProperties)
                {
                    if(passThroughLookup.ContainsKey(prop.PropertyInfo.Name)) continue;
                    #region public propert
                    if (prop.Ignore != null) continue;
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
                    optionalOrRequiredProperties.Add(prop);
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
                    foreach (var prop in optionalOrRequiredProperties)
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

        public class PassThroughInfo
        {
            //public string MemberName { get; set; }

            public string ComponentPassThroughProperty { get; set; }
            public string SubPropertyTypeString { get; set; }
        }
    }
}
