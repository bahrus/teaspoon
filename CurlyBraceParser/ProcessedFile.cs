using System.Collections.Generic;

namespace CurlyBraceParser
{
    public class ProcessedFile
    {
        public ProcessedFile()
        {
            this.Interfaces = new Dictionary<string, InterfaceStatement>();
            this.Modules = new Dictionary<string, ModuleStatement>();
            this.References = new Dictionary<string, ReferenceStatement>();
            this.Classes = new Dictionary<string, ClassStatement>();
        }
        public string FilePath { get; set; }

        public List<Line> Lines { get; set; }

        public Dictionary<string, InterfaceStatement> Interfaces { get; set; }

        public Dictionary<string, ModuleStatement> Modules { get; set; }

        public Dictionary<string, ReferenceStatement> References { get; set; }

        public Dictionary<string, ClassStatement> Classes { get; set; }
    }
}
