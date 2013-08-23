using System.Web;
using System.Linq;
using System;
using Newtonsoft.Json;
using ClassGenMacros;

namespace tspHandler
{
    public class tspHandler : IHttpHandler, IDocumentHost
    {
        private string _documentFilePath;
        public bool IsReusable
        {
            get { return true; }
        }



        public void ProcessRequest(HttpContext context)
        {
            //var currentFilePath = context.Request.PhysicalPath;
            this._documentFilePath = context.Request.PhysicalPath;
            //var content = currentFilePath.ReadFile();
            var doc = new HtmlDocumentFacade(this);
            doc
                .ProcessServerSideScripts()
                .RetrieveContext()
                .PerformServerSideProcessing()
            ;
            context.Response.Write(doc.Content);
        }

        public string GetContentOfRelativeResource(string path)
        {
            return this._documentFilePath.NavigateTo(path).ReadFile();
        }


        public string GetContentOfDocument()
        {
            return this._documentFilePath.ReadFile();
        }
    }

    public interface IDocumentHost
    {
        string GetContentOfRelativeResource(string path);

        string GetContentOfDocument();
    }
}
