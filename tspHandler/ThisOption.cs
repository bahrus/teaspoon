using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace tspHandler
{
    public class ThisOption
    {
        public bool SendClientCopy { get; set; }
        public string CSFilter { get; set; }
        public ReplaceOptions ReplaceStrategy { get; set; }
        public string CSReplacementFn { get; set; }
    }

    public enum ReplaceOptions
    {
        Replace,
        Append,
        Ignore,
        Custom,
    }
}
