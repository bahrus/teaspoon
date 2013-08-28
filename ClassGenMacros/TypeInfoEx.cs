using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
//using System.Threading.Tasks;

namespace ClassGenMacros
{
    public class TypeInfoEx
    {
        public Type Type { get; set; }

        public Type AssociatedType { get; set; }

        public IEnumerable<PropertyInfoEx> Props { get; set; }

        //public Type TypeToImplement { get; set; }

        public BaseTypeProcessorAttribute ProcessorAttribute { get; set; }

        public string OutputNamespace { get; set; }

        public string OutputContent { get; set; }

        public string SubProcessorContent { get; set; }
    }
}
