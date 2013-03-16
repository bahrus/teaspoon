using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser.CSharp
{
    public class TypeInfoEx
    {
        public Type Type { get; set; }

        public IEnumerable<PropertyInfoEx> Props { get; set; }
    }
}
