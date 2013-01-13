using System;
using System.Web;
using HtmlAgilityPack;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Noesis.Javascript;
using RemObjects.Script;

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
            var clientFilePaths = new List<List<string>>();
            foreach(var scriptTag in scriptTags){
                //var handlerAttrib = scriptTag.Attributes["data-handler"];
                var handlerAttribVal = scriptTag.getAttribute("data-handler");
                var srcAttribVal = scriptTag.getAttribute("src");
                //if (handlerAttribVal.StartsWith("server"))
                {
                    string filePath = context.Request.MapPath(srcAttribVal);
                    var filePaths = new List<string>();
                    this.GetListOfDependentFiles(filePath, filePaths);
                    //filePaths.Reverse();
                    serverFilePaths.Add(filePaths);
                    scriptTag.parentNode.removeChild(scriptTag);
                }
                //else
                //{
                    
                //}
            }

            #region check if date time stamp in memory, and matches current
            string keyTS = "tcp.TimeStamps." + context.Request.Path;
            string keyContent = "tcp.Scripts." + context.Request.Path;
            var oldFileStamps = context.Cache[keyTS] as List<long>;
            var oldContent = context.Cache[keyContent] as string;
            bool needToReadFiles = true;
            if (oldFileStamps != null && oldContent != null)
            {
                needToReadFiles = false;
                //var fileStamps = new List<long>();
                int i = 0;
                foreach (var fileGroup in serverFilePaths)
                {
                    foreach (var filePath in fileGroup)
                    {
                        if (oldFileStamps.Count < i + 1)
                        {
                            needToReadFiles = true;
                            goto DoneChecking;
                        }
                        var fi = filePath.ReplaceLast(".ts").With(".min.js").GetFileInfo();
                        var ts = fi.LastWriteTimeUtc.Ticks;
                        if (oldFileStamps[i] != ts)
                        {
                            needToReadFiles = true;
                            goto DoneChecking;
                        }
                        i++;
                    }
                }
                if (i != oldFileStamps.Count)
                {
                    needToReadFiles = true;
                }
                

            }
            #endregion
        DoneChecking:
            string script = null;
            if (needToReadFiles)
            {
                #region read file contents
                int i = 0;
                var newFileStamps = new List<long>();
                context.Cache[keyTS] = newFileStamps;
                foreach (var fileGroup in serverFilePaths)
                {
                    foreach (var filePath in fileGroup)
                    {
                        string MinifiedfilePath = filePath.ReplaceLast(".ts").With(".min.js");
                        var ts = MinifiedfilePath.GetFileInfo().LastWriteTimeUtc.Ticks;
                        newFileStamps.Add(ts);
                        var jsContent = MinifiedfilePath.ReadFile();
                        sbServerScript.AppendLine(jsContent);
                        i++;
                    }
                }
                script = sbServerScript.ToString();
                context.Cache[keyContent] = script;
                #endregion
            }
            else
            {
                script = oldContent;
            }
            #endregion
            #region run the server side javascipt

            if (script.Length > 0)
            {
                if (context.Request["tspHandler"] == "RemObjects")
                {
                    this.processWithRemObjectsScript(script, doc);
                }
                else
                {
                    this.processWithNoesisJavascript(script, doc);
                }

            }
            context.Response.Write(doc.Content);
            //context.Response.Flush();
            //context.Response.Close();
            #endregion
        }


        private void processWithNoesisJavascript(string script, HtmlDocumentFacade doc)
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
        }

        private void processWithRemObjectsScript(string script, HtmlDocumentFacade doc)
        {
            var esc = new EcmaScriptComponent();
            esc.Globals.SetVariable("document", doc);
            esc.Globals.SetVariable("window", "ignore");
            esc.Clear();
            esc.Source = script;
            esc.Debug = true;
            //esc.DebugException += esc_DebugException;
            try
            {
                esc.Run();
                esc.RunFunction("onWindowLoad");
            }
            catch
            {
                int lineNo = esc.DebugLastPos.StartRow;
            }
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

        //public void GetListOfDependentUrls(string fileURL, List<string> fileURLs, HttpContext context)
        //{
        //}

        //private string GetRelativePath(string currentPath, string linkedPath)
        //{
        //}
        #endregion
    }
}
