using System.Collections.Generic;
using System.Text;

namespace CurlyBraceParser
{
    public class ProcessedFile
    {
        public ProcessedFile()
        {
            this.Interfaces = new Dictionary<string, InterfaceStatement>();
            this.Functions = new Dictionary<string, StaticFunctionStatement>();
            this.Modules = new Dictionary<string, ModuleStatement>();
            this.References = new Dictionary<string, ReferenceStatement>();
            this.Classes = new Dictionary<string, ClassStatement>();
        }
        public string FilePath { get; set; }

        public List<Line> Lines { get; set; }

        public Dictionary<string, InterfaceStatement> Interfaces { get; set; }

        public Dictionary<string, StaticFunctionStatement> Functions { get; set; }

        public Dictionary<string, ModuleStatement> Modules { get; set; }

        public Dictionary<string, ReferenceStatement> References { get; set; }

        public Dictionary<string, ClassStatement> Classes { get; set; }

        //public string ToCSharp()
        //{
        //    var sb = new StringBuilder();
        //    foreach (var line in Lines)
        //    {
        //        line.ToCSharp(sb);
        //    }
        //    return sb.ToString();
        //}
    }

    public class ProcessedFiles : Dictionary<string, ProcessedFile>
    {

    }
}
