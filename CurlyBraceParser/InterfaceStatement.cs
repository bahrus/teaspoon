using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
    public class InterfaceStatement : OpenBraceStatement
    {
        public string[] Extends { get; set; }

        public string Name { get; set; }

        public bool Public { get; set; }
    }
}
