using ClassGenMacros;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace tspHandler
{
    public class StyleSheet
    {
        public CssRule[] rules { get; set; }
    }

    //public class Number: Union<int, float, double>{}

    //public class CssPropertyType : Union<string, Number, bool>
    //{
    //}

    public class CssRule
    {
        public string selectorText { get; set; }
        public Dictionary<string, string> style { get; set; }
    }
}
