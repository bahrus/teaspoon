using System.Collections.Generic;

namespace CurlyBraceParser
{
    public class StaticMethodStatement : OpenBraceStatement
    {
        public string Name { get; set; }

        public List<Statement> Parameters { get; set; }

        public string ReturnType { get; set; }
    }
}
