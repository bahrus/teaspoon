using System.Web;
using System.Linq;
using System;
using Newtonsoft.Json;

namespace tspHandler
{
    public class tspHandler : IHttpHandler
    {
        public bool IsReusable
        {
            get { return true; }
        }

        public void ProcessRequest(HttpContext context)
        {
            var currentFilePath = context.Request.PhysicalPath;
            var content = currentFilePath.ReadFile();
            var doc = new HtmlDocumentFacade(content);
            #region process Model
            var model = doc.getElementsByTagName("script").FirstOrDefault(node => !string.IsNullOrEmpty(node.getAttribute("data-model")));
            if (model != null)
            {
                var staticMethodString = model.getAttribute("data-model");
                var typeString = staticMethodString.SubstringBeforeLast(".");
                var methodString = staticMethodString.SubstringAfterLast(".");
                var typ = Type.GetType(typeString, true);
                var result = typ.GetMethod(methodString).Invoke(null, null);
                string json = JsonConvert.SerializeObject(result);
                model.innerHTML = "var model = " + json;
            }
            #endregion
            context.Response.Write(doc.Content);
        }
    }
}
