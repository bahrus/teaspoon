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

        private bool NeedToReadFiles(List<List<string>> filePaths, HttpContext context, string cacheKeyForTimeStamps, string cacheKeyForContent)
        {
            var oldTimeStamps = context.Cache[cacheKeyForTimeStamps] as List<long>;
            var oldContent = context.Cache[cacheKeyForContent] as string;
            if (oldTimeStamps == null || oldContent == null) return true;
            int i = 0;
            foreach (var fileGroup in filePaths)
            {
                foreach (var filePath in fileGroup)
                {
                    if (oldTimeStamps.Count < i + 1)
                    {
                        return true;
                    }
                    var fi = filePath.ReplaceLast(".ts").With(".min.js").GetFileInfo();
                    var ts = fi.LastWriteTimeUtc.Ticks;
                    if (oldTimeStamps[i] != ts)
                    {
                        return true;
                    }
                    i++;
                }
            }
            if (i != oldTimeStamps.Count)
            {
                return true;
            }
            return false;

        }

        private string ReadFiles(List<List<string>> filePaths, HttpContext context, string cacheKeyForTimeStamps, string cacheKeyForContent)
        {
            int i = 0;
            var newFileStamps = new List<long>();
            context.Cache[cacheKeyForTimeStamps] = newFileStamps;
            var sbServerScript = new StringBuilder();
            foreach (var fileGroup in filePaths)
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
            var script = sbServerScript.ToString();
            context.Cache[cacheKeyForContent] = script;
            return script;
        }

        public void ProcessRequest(HttpContext context)
        {
            string test = context.Request["tspResource"];
            if (test == "script")
            {
                context.Response.ContentType = "test/javascript";
                string keyClientSideContent = "tcp.ClientSide.Scripts." + context.Request.Path;
                string script = context.Cache[keyClientSideContent] as string;
                context.Response.Write(script);
                return;
            }
            bool isClientSideDebug = context.Request["tsp.debug"] == "true";
            string currentFilePath = context.Request.PhysicalPath;
            string content = currentFilePath.ReadFile();
            HtmlDocumentFacade doc = new HtmlDocumentFacade(content);
            StringBuilder sbServerScript = new StringBuilder();
            #region get all the script tags and read the files for the server based ones
            var scriptTags = doc.getElementsByTagName("script");
            var  serverFilePaths = new List<List<string>>();
            
            var clientFilePaths = new List<List<string>>();
            HtmlNodeFacade header = null;
            HtmlNodeFacade firstClientNode = null;
            foreach(var scriptTag in scriptTags){
                //var handlerAttrib = scriptTag.Attributes["data-handler"];
                var handlerAttribVal = scriptTag.getAttribute("data-handler");
                var srcAttribVal = scriptTag.getAttribute("src");

                if (!string.IsNullOrEmpty(handlerAttribVal))
                {
                    string filePath = context.Request.MapPath(srcAttribVal);
                    var filePaths = new List<string>();
                    this.GetListOfDependentFiles(filePath, filePaths);
                    //filePaths.Reverse();
                    bool isServerNode = false;
                    if (handlerAttribVal.Contains("server"))
                    {
                        isServerNode = true;
                        serverFilePaths.Add(filePaths);
                    }
                    else
                    {
                        clientFilePaths.Add(filePaths);
                    }
                    if(header==null){
                        header = scriptTag.parentNode;
                    }
                    if (!isServerNode && !isClientSideDebug && firstClientNode == null)
                    {
                        firstClientNode = scriptTag;
                    }
                    else
                    {
                        header.removeChild(scriptTag);
                    }
                }

            }
            #region process server side script
            #region check if date time stamp in memory, and matches current
            string keyServerSideTS = "tcp.ServerSide.TimeStamps." + context.Request.Path;
            string keyServerSideContent = "tcp.ServerSide.Scripts." + context.Request.Path;

            bool needToReadServerFiles = this.NeedToReadFiles(serverFilePaths, context, keyServerSideTS, keyServerSideContent);
            #endregion
            string serverSideScript = null;
            if (needToReadServerFiles)
            {
                serverSideScript = this.ReadFiles(serverFilePaths, context, keyServerSideTS, keyServerSideContent);
 
            }
            else
            {
                serverSideScript = context.Cache[keyServerSideContent] as string;
            }
            #endregion
            #region run the server side javascipt

            if (serverSideScript.Length > 0)
            {
                if (context.Request["tspHandler"] == "RemObjects")
                {
                    this.processWithRemObjectsScript(serverSideScript, doc);
                }
                else
                {
                    this.processWithNoesisJavascript(serverSideScript, doc);
                }

            }
            #endregion
            if (firstClientNode != null)
            {
  
                #region process client side script
                #region check if date time stamp in memory, and matches current
                string keyClientSideTS = "tcp.ClientSide.TimeStamps." + context.Request.Path;
                string keyClientSideContent = "tcp.ClientSide.Scripts." + context.Request.Path;

                bool needToReadClientFiles = this.NeedToReadFiles(clientFilePaths, context, keyClientSideTS, keyClientSideContent);
                #endregion
                string clientSideScript = null;
                if (needToReadServerFiles)
                {
                    clientSideScript = this.ReadFiles(clientFilePaths, context, keyClientSideTS, keyClientSideContent);

                }
                else
                {
                    clientSideScript = context.Cache[keyClientSideContent] as string;
                }
                string path = context.Request.Path;
                if (path.Contains("&"))
                {
                    path += "&";
                }
                else
                {
                    path += "?";
                }
                path += "tspResource=script";
                string guid = Guid.NewGuid().ToString().Replace("-", "_");
                path += "&g=" + guid;
                firstClientNode.setAttribute("src", path);
                #endregion


            }
            else if (isClientSideDebug)
            {
                #region expand out all the script tags
                string currDir = context.Request.MapPath(".");
                foreach (var fileGroup in clientFilePaths)
                {
                    foreach (var filePath in fileGroup)
                    {
                        string relativePath = currDir.RelativeTo(filePath);
                        relativePath = relativePath.ReplaceLast(".ts").With(".js");
                        var scriptTag = doc.createElement("script");
                        var textNode = doc.createTextNode(string.Empty);
                        scriptTag.setAttribute("src", relativePath.Replace("\\", "/"));
                        scriptTag.appendChild(textNode);
                        header.appendChild(scriptTag);
                    }
                }
                #endregion
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
