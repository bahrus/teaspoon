using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
    public interface ISignatureElement
    {
        string Type { get; set; }
    }

    public interface IDataElement : ISignatureElement
    {
        string Name { get; set; }
        
    }

    public interface IParameter : IDataElement
    {
        string InitialValue { get; set; }
    }

    public class Parameter : IDataElement
    {
        public string InitialValue { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
    }

    public interface IMethodElement : IDataElement
    {
        
    }

    
}
