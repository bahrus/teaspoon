using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser.CSharp
{
    public static class InterfaceStatementCSharp
    {
        public static void Content(this List<InterfaceStatement> Interfaces)
        {
            if (Interfaces == null) return;
            foreach (var IF in Interfaces)
            {
                string InterfaceDeclaration = (IF.Public ? "public " : "") + "interface " + IF.Name;
                using (new Block(InterfaceDeclaration))
                {
                }
            }
        }
    }
}
