using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CurlyBraceParser
{


    public class Parameter : IDataElement
    {
        public string InitialValue { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string HelpText { get; set; }
    }

    public interface IMethodElement : IDataElement
    {
        
    }

    
}
