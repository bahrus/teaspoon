namespace Autogen
open System
open System.Reflection
open System.ComponentModel.DataAnnotations

type PropertyInfoEx(propertyInfo : PropertyInfo) =
     member this.PropertyInfo   = propertyInfo
     member this.DefaultValue   = propertyInfo.GetCustomAttribute<DefaultValueAttribute>()
     member this.Required       = propertyInfo.GetCustomAttribute<RequiredAttribute>()
     member this.Ignore         = propertyInfo.GetCustomAttribute<Attribs.DoNotAutoGenerateAttribute>()
     member this.PassThrough    = propertyInfo.GetCustomAttribute<Attribs.PassThroughComponentAttribute>()


    

//public class PropertyInfoEx : IComparable<PropertyInfoEx>
//    {
//        public PropertyInfo PropertyInfo { get; set; }
//
//        public DefaultValueAttribute DefaultValue { get; set; }
//
//        public RequiredAttribute Required { get; set; }
//
//        public DoNotAutoGenerateAttribute Ignore { get; set; }
//
//        public PassThroughComponentAttribute PassThrough { get; set; }
//
//        public override string ToString()
//        {
//            return this.PropertyInfo.Name;
//        }
//
//
//        public int CompareTo(PropertyInfoEx other)
//        {
//            if (other.PropertyInfo.PropertyType.IsAssignableFrom(this.PropertyInfo.PropertyType)) return 1;
//            if (this.PropertyInfo.PropertyType.IsAssignableFrom(other.PropertyInfo.PropertyType)) return -1;
//            return this.PropertyInfo.Name.CompareTo(other.PropertyInfo.Name);
//        }
//    }

