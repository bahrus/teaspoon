using System.Web;
using System.Linq;
using System;
using Newtonsoft.Json;
using ClassGenMacros;
using System.Web.SessionState;

namespace tspHandler
{
    public class tspHandler : IHttpHandler, IDocumentHost, IReadOnlySessionState
    {
        private string _documentFilePath;
        public bool IsReusable
        {
            get { return false; }
        }

        public bool IsDesignMode()
        {
            return HttpContext.Current.Request[tspProcessor.modeParameter] == "design";
        }

        public bool IsTraceMode()
        {
            return HttpContext.Current.Request[tspProcessor.modeParameter] == "trace";
        }

        public tspHandler() { }

        public tspHandler(string filePath)
        {
            this._documentFilePath = filePath;
        }


        public void ProcessRequest(HttpContext context)
        {
            this._documentFilePath = context.Request.PhysicalPath;
            var doc = this.ProcessFile();
            context.Response.Write(doc.Content);
        }

        public HtmlDocumentFacade ProcessFile()
        {
            
            var doc = new HtmlDocumentFacade(this);
            var req = HttpContext.Current.Request;
            var src = req["DBS.src"];
            if (src == "hif")
            {
                doc.IDSelector = req["DBS.id"];
            }
            return doc.Process();
            
        }

        public string GetContentOfRelativeResource(string path)
        {
            return this.GetFilePathOfRelativeResource(path).ReadFile();
        }

        public string GetFilePathOfRelativeResource(string path)
        {
            return this._documentFilePath.NavigateTo(path);
        }

        public string GetRelativePathOfFilePath(string filePath)
        {
            return this._documentFilePath.RelativeTo(filePath);
        }

        public string GetContentOfDocument()
        {
            return this._documentFilePath.ReadFile();
        }


        public string GetDocumentFilePath()
        {
            return _documentFilePath;
        }
    }

    public interface IDocumentHost
    {
        string GetContentOfRelativeResource(string path);

        string GetContentOfDocument();

        string GetFilePathOfRelativeResource(string path);

        string GetRelativePathOfFilePath(string path);

        bool IsDesignMode();

        bool IsTraceMode();

        string GetDocumentFilePath();
    }
}
