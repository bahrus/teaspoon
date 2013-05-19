using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace ClassGenMacros
{
    public class PropertyInfoEx : IComparable<PropertyInfoEx>
    {
        public PropertyInfo PropertyInfo { get; set; }

        public DefaultValueAttribute DefaultValue { get; set; }

        public RequiredAttribute Required { get; set; }

        public DoNotAutoGenerateAttribute Ignore { get; set; }

        public PassThroughComponentAttribute PassThrough { get; set; }

        public override string ToString()
        {
            return this.PropertyInfo.Name;
        }


        public int CompareTo(PropertyInfoEx other)
        {
            if (other.PropertyInfo.PropertyType.IsAssignableFrom(this.PropertyInfo.PropertyType)) return 1;
            if (this.PropertyInfo.PropertyType.IsAssignableFrom(other.PropertyInfo.PropertyType)) return -1;
            return this.PropertyInfo.Name.CompareTo(other.PropertyInfo.Name);
        }
    }

    
}
