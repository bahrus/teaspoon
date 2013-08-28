using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ClassGenMacros
{
    public class TypeScriptTypeGenerator : IProcessType
    {
        public void Process(TypeInfoEx typeInfoEx)
        {
            string declaringTypeName = typeInfoEx.Type.DeclaringType != null ? typeInfoEx.Type.DeclaringType.Name : null;
            string interfaceName = typeInfoEx.Type.Name;
            //bool isStandardInterfaceName = interfaceName.StartsWith("I")
            //    && interfaceName.Length > 1
            //    && interfaceName.Substring(1, 1) == interfaceName.Substring(1, 1).ToUpper();
            //string shortClassName = isStandardInterfaceName ? interfaceName.Substring(1) : interfaceName;
            //string className = typeInfoEx.ProcessorAttribute.ClassImplementorName ??
            //    shortClassName + (declaringTypeName == null ?
            //        string.Empty : "_" + declaringTypeName);
            //if (!isStandardInterfaceName) className += "_defaultImpl";
            Block.IncrementLevel();
            using (new Block("export interface " + interfaceName + " : " + typeInfoEx.Type.FullQName(typeInfoEx.Type.Namespace)))
            {
                
                #region interface body
                var allProperties = typeInfoEx.Props.ToList();
                //var propertiesWithDefaultValues = new List<PropertyInfoEx>();
                //var requiredProperties = new List<PropertyInfoEx>();
                //var optionalPropertiesWithNoDefaultValues = new List<PropertyInfoEx>();
                //var optionalOrRequiredProperties = new List<PropertyInfoEx>();
                
                var alreadyProcessed = new Dictionary<string, bool>();
                foreach (var prop in allProperties)
                {
                    if (alreadyProcessed.ContainsKey(prop.PropertyInfo.Name)) continue;
                    alreadyProcessed[prop.PropertyInfo.Name] = true;
                    #region public propert
                    if (prop.Ignore != null) continue;
                    string optional = (prop.Required != null) ? string.Empty : "?";
                    Block.AppendClosingStatement(prop.PropertyInfo.Name + optional +  ":" + prop.PropertyInfo.PropertyType.FullQName(typeInfoEx.Type.Namespace) + ";");
                    
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
