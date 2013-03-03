using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser.CSharp
{
    public class CSharpFile
    {
        public string NameSpace { get; set; }

        public string OuterStaticClassName { get; set; }

        public string Content
        {
            get
            {
                Block.AppendStatement("using System");
                Block.AppendStatement("using System.Collections.Generic");
                using (new Block(this.NameSpace == null ? null : "namespace " + this.NameSpace))
                {
                    using (new Block(this.OuterStaticClassName == null ? null : "public static partial class " + this.OuterStaticClassName))
                    {
                        this.Interfaces.Content();
                    }
                }
                return Block.Text;
            }
        }

        public List<InterfaceStatement> Interfaces { get; set; }
    }
}
