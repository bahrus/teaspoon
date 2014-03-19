using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ClassGenMacros;

namespace tspHandler
{
    public static partial class tspProcessor
    {
        public static HtmlDocumentFacade ProcessEmmetSpaces(this HtmlDocumentFacade doc)
        {
            var emmetTagsWithSpaces = doc.querySelectorAll("script[type='text/emmet']").ToList();
            emmetTagsWithSpaces.ForEach(node =>
            {
                string content = node.innerHTML.Trim();
                content = content.RemoveWhiteSpaceOutsideGroupings(new char[] { '{' }, new char[] { '}' });
                node.innerHTML = content;
            });
            return doc;
        }
    }
}
