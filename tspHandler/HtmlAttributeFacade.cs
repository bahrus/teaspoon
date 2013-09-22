using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace tspHandler
{
    public class HtmlAttributeFacade
    {
        private HtmlAttribute _attrib;

        public HtmlAttributeFacade(HtmlAttribute attrib)
        {
            _attrib = attrib;
        }

        public string name
        {
            get { return _attrib.Name; }
        }

        public string value
        {
            get { return _attrib.Value; }
        }
    }
}
