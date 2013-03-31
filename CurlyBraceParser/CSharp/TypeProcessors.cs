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
            using (new Block("public partial class " + className + " : " + typeInfoEx.Type.FullQName(typeInfoEx.Type.Namespace)))
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
            var typeToImplement = typeInfoEx.ProcessorAttribute.AssociatedType;
            using (new Block("public partial class " + className + " : " + typeToImplement.FullQName(typeInfoEx.Type.Namespace)))
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
    
    public class ExtensionMethodsImplementor : IProcessType
    {
        public static string GetExtensionMethodsClassName(TypeInfoEx typeInfoEx)
        {
            return typeInfoEx.Type.Name + "_ext";
        }

        public static string GetExtensionMethodsClassNS(TypeInfoEx typeInfoEx, string rootNS)
        {
            string ns = typeInfoEx.Type.Namespace;
            if (rootNS != null)
            {
                string rootNSDot = rootNS + ".";
                if (ns.StartsWith(rootNSDot)) ns = ns.SubstringAfter(rootNSDot);
            }
            return ns + "." + GetExtensionMethodsClassName(typeInfoEx) + "ns";
        }

        public void Process(TypeInfoEx typeInfoEx)
        {

            string className = GetExtensionMethodsClassName(typeInfoEx);
            string ns = GetExtensionMethodsClassNS(typeInfoEx, null);
            Block.IncrementLevel();
            using (new Block("public static class " + className))
            {
                #region static extension class
                Block.AppendStatement("private static " + typeInfoEx.Type.Name + " _this");
                using (new Block("static " + className + "()"))
                {
                    Block.AppendStatement("_this = new " + typeInfoEx.Type.Name + "()");
                }
                var methods = typeInfoEx.Type.GetMethods().Where(method =>{
                    switch(method.Name){
                        case "ToString":
                        case "Equals":
                        case "GetHashCode":
                        case "GetType":
                            return false;
                        default:
                            return true;
                    }

                });
                foreach (var method in methods)
                {
                    var methodParams = method.GetParameters(); 
                    var incomingArgs =methodParams
                        .Select(pi => pi.ParameterType.FullQName(ns) + " " + pi.Name +
                            (pi.HasDefaultValue ? "=" + pi.DefaultValue : null))
                        .ToList();
                    
                    var callingArgs = method.GetParameters()
                        .Select(pi => pi.Name)
                        .ToList();
                    int indxOfTargetType = methodParams.Select(pi => pi.ParameterType).ToList().FindIndex(t => t == typeInfoEx.ProcessorAttribute.AssociatedType);
                    if (indxOfTargetType > 0)
                    {
                        incomingArgs.MoveItem(indxOfTargetType, 0);
                        //callingArgs.MoveItem(indxOfTargetType, 0);
                    }
                    else if (indxOfTargetType < 0)
                    {
                        continue;
                    }
                    if (incomingArgs.Count > 0)
                    {
                        incomingArgs[0] = "this " + incomingArgs[0];
                    }
                    string returnTypeString = method.ReturnType.FullQName(ns);
                    using (new Block("public static " + returnTypeString + " " + method.Name + "(" + string.Join(", ", incomingArgs) + ")"))
                    {
                        Block.AppendStatement((returnTypeString == "void" ? string.Empty : "return ") +  "_this." + method.Name + "(" + string.Join(", ", callingArgs) + ")");
                    }
                }
                #endregion
            }
            Block.AppendClosingStatement("public class " + typeInfoEx.Type.Name + "_Ref{}");
            Block.DecrementLevel();
            typeInfoEx.OutputNamespace = ns;
            typeInfoEx.OutputContent = Block.Text;
        }
    }

    public class ExtensionMethodsReferencer : IProcessType
    {
        public void Process(TypeInfoEx typeInfoEx)
        {
            var extType = typeInfoEx.ProcessorAttribute.AssociatedType;
            using (new Block("namespace " + extType.Namespace))
            {
                using (new Block("public static class " + typeInfoEx.Type.Namespace.Replace(".", "_") + typeInfoEx.Type.Name + "Extension"))
                {
                    Block.AppendClosingStatement("public static void Extend(this " + extType.FullQName(extType.Namespace) + " _this, "
                        + ExtensionMethodsImplementor.GetExtensionMethodsClassNS(typeInfoEx, extType.Namespace) + "." + typeInfoEx.Type.Name + "_Ref" + " Extender){}");

                }
            }
            typeInfoEx.SubProcessorContent += Block.Text;
        }
    }

    public class AutoGenerateNames : IProcessType
    {
        public void Process(TypeInfoEx typeInfoEx)
        {
            string className = typeInfoEx.Type.Name.SubstringAfter("NamesOf");
            Block.IncrementLevel();
            using (new Block("public class " + className))
            {
                //int i = 1;
                typeInfoEx.Type.GetConstants().ToList().ForEach(fieldInfo =>{
                    string stringClassName = fieldInfo.Name + "String";
                    using (new Block("public class " + stringClassName))
                    {
                        Block.AppendClosingStatement("public string Value{get;set;}");
                        using (new Block("public static implicit operator " + stringClassName + "(string stringConstructor)"))
                        {
                            Block.AppendStatement("return new " + stringClassName + "{Value = stringConstructor,}");
                        }
                    }
                    using (new Block("public static " + stringClassName + " " + fieldInfo.Name))
                    {
                        string fieldValue = fieldInfo.GetRawConstantValue().ToString();
                        Block.AppendClosingStatement("get{ return \"" + fieldValue + "\";}");
                    }
                });
                
            }
            Block.DecrementLevel();
            typeInfoEx.OutputNamespace = typeInfoEx.Type.Namespace;
            typeInfoEx.OutputContent = Block.Text;
        }
    }
}
