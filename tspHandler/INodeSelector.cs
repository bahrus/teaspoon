using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace tspHandler
{
    public interface INodeSelector
    {
        JSArrayFacade<HtmlNodeFacade> querySelectorAll(string selectorText);
    }
}
