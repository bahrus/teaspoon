using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace tspHandler
{
    public static partial class tspProcessor
    {

        private const string reserved_lazyLoad = "reserved_lazyLoad";

        public static HtmlDocumentFacade ProcessLazyElements(this HtmlDocumentFacade doc){
            var lazyElements = doc.querySelectorAll("*[data-display='lazy']").ToList();
            lazyElements.ForEach(el =>
            {
                var ndHidden = doc.createElement("script");
                var sOriginalID = el.id;
                el.setAttribute("data-originalID", sOriginalID);
                el.id = el.id + "_temp";
                ndHidden.id = sOriginalID;
                ndHidden.setAttribute("type", "text/html");
                ndHidden.addClass(reserved_lazyLoad);
                var inserted = el.parentNode.insertBefore(ndHidden, el);
                inserted.appendChild(el);
            });
            return doc;
        }
    }
}
