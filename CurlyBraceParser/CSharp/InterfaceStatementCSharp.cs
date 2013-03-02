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
                    if (IF.Children != null)
                    {
                        foreach (var line in IF.Children)
                        {
                            TranspileInterfaceLine(line);
                        }
                    }
                }
            }
        }

        private static void TranspileInterfaceLine(Line line)
        {
            if (string.IsNullOrEmpty(line.Content)) return;
            if (!line.Content.Contains(':')) return;
            string MemberName = line.Content.SubstringBefore(":").Trim().SubstringBefore("?");
            string TypeInfo = line.Content.SubstringAfter(":").Trim().TrimEnd(';');
            Block.AppendStatement(TypeInfo + " " + MemberName);
        }
    }
}
