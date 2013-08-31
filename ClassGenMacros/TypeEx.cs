using System;
using System.CodeDom.Compiler;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;


namespace ClassGenMacros
{
    public static class TypeEx
    {


        public static PropertyInfo[] GetPublicProperties(this Type type)
        {
            if (type.IsInterface)
            {
                var propertyInfos = new List<PropertyInfo>();

                var considered = new List<Type>();
                var queue = new Queue<Type>();
                considered.Add(type);
                queue.Enqueue(type);
                while (queue.Count > 0)
                {
                    var subType = queue.Dequeue();
                    foreach (var subInterface in subType.GetInterfaces())
                    {
                        if (considered.Contains(subInterface)) continue;

                        considered.Add(subInterface);
                        queue.Enqueue(subInterface);
                    }

                    var typeProperties = subType.GetProperties(
                        BindingFlags.FlattenHierarchy
                        | BindingFlags.Public
                        | BindingFlags.Instance);

                    var newPropertyInfos = typeProperties
                        .Where(x => !propertyInfos.Contains(x));

                    propertyInfos.InsertRange(0, newPropertyInfos);
                }

                return propertyInfos.ToArray();
            }

            return type.GetProperties(BindingFlags.FlattenHierarchy
                | BindingFlags.Public | BindingFlags.Instance);
        }

        

        public static string FullQCSharpName(this Type type, string rootNS)
        {
            if (type.IsGenericType)
            {
                string genericBase = type.FullName.SubstringBefore("`");
                if (rootNS != null)
                {
                    string rootNSDot = rootNS + ".";
                    if (genericBase.StartsWith(rootNSDot)) genericBase = genericBase.SubstringAfter(rootNSDot);
                    
                }
                //type.GetGenericArguments()
                //var args = type.GenericTypeArguments.Select(genericArgType => genericArgType.FullQCSharpName(rootNS));
                var args = type.GetGenericArguments().Select(genericArgType => genericArgType.FullQCSharpName(rootNS));
                return genericBase + "<" + String.Join(", ", args.ToArray()) + ">";
            }
            var fn = type.FullName.Replace('+', '.');
            if (rootNS != null)
            {
                string rootNSDot = rootNS + ".";
                if (fn.StartsWith(rootNSDot)) fn = fn.SubstringAfter(rootNSDot);
            }
            switch (fn)
            {
                case "System.Void":
                    return "void";
                default: return fn;
            }
        }

        public static string FullQTypeScriptName(this Type type, string rootNS)
        {
            if (type.IsGenericType)
            {
                string genericBase = type.FullName.SubstringBefore("`");
                if (rootNS != null)
                {
                    string rootNSDot = rootNS + ".";
                    if (genericBase.StartsWith(rootNSDot)) genericBase = genericBase.SubstringAfter(rootNSDot);

                }
                //type.GetGenericArguments()
                //var args = type.GenericTypeArguments.Select(genericArgType => genericArgType.FullQCSharpName(rootNS));
                var args = type.GetGenericArguments().Select(genericArgType => genericArgType.FullQCSharpName(rootNS));
                return genericBase + "<" + String.Join(", ", args.ToArray()) + ">";
            }
            var fn = type.FullName.Replace('+', '.');
            if (rootNS != null)
            {
                string rootNSDot = rootNS + ".";
                if (fn.StartsWith(rootNSDot)) fn = fn.SubstringAfter(rootNSDot);
            }
            return fn
                .Replace("System.Void", "void")
                .Replace("System.String", "string")
                .Replace("System.DateTime", "Date")
                .Replace("System.Single", "number")
            ;
            
        }

        public static string ToCharpValue(this object Obj)
        {
            if (Obj == null) return "null";
            if (Obj is string)
            {
                return "\"" + Obj + "\"";
            }
            return Obj.ToString();
        }

        /// <SUMMARY>
        /// This method will return all the constants from a particular
        /// type including the constants from all the base types.  from http://weblogs.asp.net/whaggard/archive/2003/02/20/2708.aspx
        /// </SUMMARY>
        /// <PARAM NAME="TYPE">type to get the constants for</PARAM>
        /// <RETURNS>array of FieldInfos for all the constants</RETURNS>
        public static  FieldInfo[] GetConstants(this Type type)
        {
            ArrayList constants = new ArrayList();

            FieldInfo[] fieldInfos = type.GetFields(
                // Gets all public and static fields

                BindingFlags.Public | BindingFlags.Static |
                // This tells it to get the fields from all base types as well

                BindingFlags.FlattenHierarchy);

            // Go through the list and only pick out the constants
            foreach (FieldInfo fi in fieldInfos)
                // IsLiteral determines if its value is written at 
                //   compile time and not changeable
                // IsInitOnly determine if the field can be set 
                //   in the body of the constructor
                // for C# a field which is readonly keyword would have both true 
                //   but a const field would have only IsLiteral equal to true
                if (fi.IsLiteral && !fi.IsInitOnly)
                    constants.Add(fi);

            // Return an array of FieldInfos
            return (FieldInfo[])constants.ToArray(typeof(FieldInfo));
        }

        public static T GetCustAttrib<T>(this Type type) where T: Attribute
        {
            var attribs = type.GetCustomAttributes(typeof(T), true);
            if (attribs.Length == 0) return null;
            return attribs[0] as T;
        }

        public static T GetCustAttrib<T>(this PropertyInfo pi) where T : Attribute
        {
            var attribs = pi.GetCustomAttributes(typeof(T), true);
            if (attribs.Length == 0) return null;
            return attribs[0] as T;
        }

        public static T GetCustAttrib<T>(this Assembly assbly) where T : Attribute
        {
            var attribs = assbly.GetCustomAttributes(typeof(T), true);
            if (attribs.Length == 0) return null;
            return attribs[0] as T;
        }

        public static List<T> GetCustAttribs<T>(this Assembly assbly) where T : Attribute
        {
            var attribs = assbly.GetCustomAttributes(typeof(T), true);
            return attribs.Select(attrib => attrib as T).ToList();
        }

    }

    

    
}
