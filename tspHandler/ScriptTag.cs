using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace tspHandler
{
    public class ScriptTag
    {
        public JSFunction[] Functions { get; set; }
    }

    public class JSFunction
    {
        public string Name { get; set; }
        public string[] Params { get; set; }
    }
}
