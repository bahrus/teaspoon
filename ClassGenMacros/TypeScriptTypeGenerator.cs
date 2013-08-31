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
            Block.IncrementLevel();
            using (new Block("export interface " + interfaceName))
            {
                
                #region interface body
                var allProperties = typeInfoEx.Props.ToList();
                var alreadyProcessed = new Dictionary<string, bool>();
                foreach (var prop in allProperties)
                {
                    if (alreadyProcessed.ContainsKey(prop.PropertyInfo.Name)) continue;
                    alreadyProcessed[prop.PropertyInfo.Name] = true;
                    #region public propert
                    if (prop.Ignore != null) continue;
                    string optional = (prop.Required != null) ? string.Empty : "?";
                    Block.AppendClosingStatement(prop.PropertyInfo.Name + optional + ":" + prop.PropertyInfo.PropertyType.FullQTypeScriptName(typeInfoEx.Type.Namespace) + ";");
                    
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
