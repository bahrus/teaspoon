using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace tspHandler
{
    public static partial class tspProcessor
    {
        public static HtmlDocumentFacade ProcessServerSideForms(this HtmlDocumentFacade doc)
        {
            var head = doc.head;
            var foundDisableTag = false;
            if (head != null)
            {
                var metaTags = head.querySelectorAll("meta[name='DBS.FormPrepopulate']");//"[content='Disable:True")
                
                metaTags.ForEach(metaTag =>
                {
                    var contentAttrib = metaTag.getAttribute("content");
                    if (contentAttrib != null && contentAttrib.Contains("disable:true"))
                    {
                        foundDisableTag = true;
                        return;
                    }
                });
            }
            if (foundDisableTag) return doc;
            //var reqParams = HttpContext.Current.Request.QueryString;
            var reqParams = HttpContext.Current.Request.Params;
            

            var inputs = doc.querySelectorAll("input");
            //var inputs = doc.querySelectorAll("input[type='submit']");
            
            inputs.ToList().ForEach(input =>
            {
                var name = input.name;
                var reqVal = reqParams[name];
                var type = input.type;
                if (type == "submit")
                {
                    #region populate buttons
                    if (reqVal != null)
                    {
                        if (reqVal == input.value)
                        {
                            input.setAttribute("data-eventName", "clicked");
                        }
                    }
                    #endregion
                }
                else
                {
                    #region populate fields

                    input.value = reqVal;

                    #endregion
                }
                

            });
            return doc;
        }

    }
}
