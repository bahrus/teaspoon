using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace ClassGenMacros
{
    public class PropertyInfoEx
    {
        public PropertyInfo PropertyInfo { get; set; }

        public DefaultValueAttribute DefaultValue { get; set; }

        public RequiredAttribute Required { get; set; }

    }


}
