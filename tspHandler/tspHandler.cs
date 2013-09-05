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
            get { return true; }
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
            doc.Process();
            return doc;
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
    }

    public interface IDocumentHost
    {
        string GetContentOfRelativeResource(string path);

        string GetContentOfDocument();

        string GetFilePathOfRelativeResource(string path);

        string GetRelativePathOfFilePath(string path);
    }
}
