using System;
using System.Web;
using HtmlAgilityPack;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Noesis.Javascript;

namespace tspHandler
{
    public class htmlProcessor : IHttpHandler
    {
        /// <summary>
        /// You will need to configure this handler in the Web.config file of your 
        /// web and register it with IIS before being able to use it. For more information
        /// see the following link: http://go.microsoft.com/?linkid=8101007
        /// </summary>
        #region IHttpHandler Members

        public bool IsReusable
        {
            // Return false in case your Managed Handler cannot be reused for another request.
            // Usually this would be false in case you have some state information preserved per request.
            get { return true; }
        }

        //private string _content;
        //private HtmlDocumentFacade _doc;
        public void ProcessRequest(HttpContext context)
        {
            string currentFilePath = context.Request.PhysicalPath;
            string content = currentFilePath.ReadFile();
            HtmlDocumentFacade doc = new HtmlDocumentFacade(content);
            StringBuilder sbServerScript = new StringBuilder();
            #region get all the script tags and read the files for the server based ones
            var scriptTags = doc.getElementsByTagName("script");
            var  serverFilePaths = new List<List<string>>();
            foreach(var scriptTag in scriptTags){
                //var handlerAttrib = scriptTag.Attributes["data-handler"];
                var handlerAttribVal = scriptTag.getAttribute("data-handler");
                var srcAttribVal = scriptTag.getAttribute("src");
                if(handlerAttribVal == "server"){
                    string filePath = context.Request.MapPath(srcAttribVal);
                    var filePaths = new List<string>();
                    this.GetListOfDependentFiles(filePath, filePaths);
                    //filePaths.Reverse();
                    serverFilePaths.Add(filePaths);
                    scriptTag.parentNode.removeChild(scriptTag);
                }
            }
            
            foreach (var fileGroup in serverFilePaths)
            {
                foreach (var filePath in fileGroup)
                {
                    var jsContent = filePath.ReplaceLast(".ts").With(".js").ReadFile();
                    sbServerScript.AppendLine(jsContent);
                }
            }
            #endregion
            #region run the server side javascipt
            string script = sbServerScript.ToString();
            if (script.Length > 0)
            {
                using (var jsContext = new JavascriptContext())
                {

                    // Setting the externals parameters of the context
                    jsContext.SetParameter("document", doc);
                    jsContext.SetParameter("window", "ignore");
                    

                    // Running the script
                    jsContext.Run(script);

                    // Getting a parameter
                }
                //var esc = new EcmaScriptComponent();
                //esc.Globals.SetVariable("document", doc);
                //esc.Globals.SetVariable("window", "ignore");
                //esc.Clear();
                //esc.Source = script;
                //esc.Debug = true;
                //esc.DebugException += esc_DebugException;
                //try
                //{
                //    esc.Run();
                //    esc.RunFunction("onWindowLoad");
                //}
                //catch
                //{
                //    int lineNo = esc.DebugLastPos.StartRow;
                //}

            }
            context.Response.Write(doc.Content);
            //context.Response.Close();
            #endregion
        }

        

        

        public void GetListOfDependentFiles(string filePath, List<string> filePaths)
        {
            if (filePaths.Contains(filePath)) return;
            //filePaths.Add(filePath);
            string content = filePath.ReadFile();
            StringReader sr = new StringReader(content);
            while (sr.Peek() != -1)
            {
                string line = sr.ReadLine();
                if (line.Trim().Length == 0) continue;
                string path = line.SubstringBetween("///<reference path=").And("/>");
                if (string.IsNullOrEmpty(path)) break;
                path = path.Trim().Replace("\"", "").Replace("'", "");
                var pathTokens = path.Split('/');
                var filePathTokens = filePath.Split('\\');
                var filePathTokenStack = new Stack<string>();
                foreach (string filePathToken in filePathTokens)
                {
                    filePathTokenStack.Push(filePathToken);
                }
                filePathTokenStack.Pop();
                foreach (string dirName in pathTokens)
                {
                    if (dirName == "..")
                    {
                        filePathTokenStack.Pop();
                    }
                    else
                    {
                        filePathTokenStack.Push(dirName);
                    }
                }
                var sl = new List<string>();
                while (filePathTokenStack.Count > 0)
                {
                    sl.Add(filePathTokenStack.Pop());
                }
                sl.Reverse();
                path = string.Join("\\", sl.ToArray());
                GetListOfDependentFiles(path, filePaths);
                
            }
            //filePaths.Remove(filePath);
            filePaths.Add(filePath);
        }
        #endregion
    }
}
