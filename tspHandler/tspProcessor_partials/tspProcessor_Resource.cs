using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using ClassGenMacros;
using System.Web;

namespace tspHandler
{
    public static partial class tspProcessor
    {

        public const string MappingSeparator = "<-->";

        

        private static Dictionary<string, List<string>> ProcessTypeScriptMappingFile(this HtmlDocumentFacade DepDoc, string DepDocFilePath)
        {
            var header = DepDoc.head;
            var links = header.querySelectorAll("link[rel='import']").ToList();
            var returnObj = new Dictionary<string, List<string>>();
            foreach (var link in links)
            {
                var href = link.getAttribute("href");
                var linkFilePath = DepDocFilePath.NavigateTo(href);
                var fs = new FileStream(linkFilePath, FileMode.Open, FileAccess.Read, FileShare.Read);
                using (var sr = new StreamReader(fs))
                {
                    while (sr.Peek() != -1)
                    {
                        var lineOfText = sr.ReadLine().Trim();
                        if (!lineOfText.StartsWith("<script")) continue;
                        var LHS = lineOfText.SubstringBefore("></script>=<script ");
                        LHS = LHS.SubstringAfter("=").Trim('"', '\'');
                        var typeDefFilePath = linkFilePath.NavigateTo(LHS);
                        var RHS = lineOfText.SubstringAfter("></script>=<script src=");
                        RHS = RHS.Replace("\"></script>", string.Empty).Replace("<script src=\"", string.Empty).Trim('"', '\'');
                        var implPaths = RHS.Split('+').Select(s => linkFilePath.NavigateTo(s)).ToList();

                        returnObj[typeDefFilePath] = implPaths;
                        //LHS = LHS.SubstringAfter("<script src=\"");
                    }
                    sr.Close();
                }
            }
            return returnObj;

        }


        public static HtmlDocumentFacade ProcessResourceDependencies(this HtmlDocumentFacade doc)
        {
            var resourceDependencies = doc.head.querySelectorAll("link[rel='import']").ToList();
            var isLocal = HttpContext.Current.Request.IsLocal;
            resourceDependencies.ForEach(rd =>
            {
                var relPath = rd.getAttribute("href");
                string mode = rd.getAttribute("data-mode");
                string content = doc.GetHostContent(relPath);
                
                var depDoc = new HtmlDocumentFacade(content);
                var metaProcessor = depDoc.head.querySelectorAll("meta[name='importProcessor'][content='DBS.mergeAssets']");
                if (metaProcessor.Count == 0) return;
                var depDocFilePath = doc.GetHostContentFilePath(relPath);
                DateTime latestTimeStamp = new DateTime(0);
                if(isLocal){
                    var fi = new FileInfo(depDocFilePath);
                    if(fi.LastWriteTime > latestTimeStamp){
                        latestTimeStamp = fi.LastWriteTime;
                    }
                    var fi2 = new FileInfo(doc.Host.GetDocumentFilePath());
                    if (fi2.LastWriteTime > latestTimeStamp)
                    {
                        latestTimeStamp = fi2.LastWriteTime;
                    }
                }
                var header = depDoc.head;
                #region find type def mappings
                
                var typeDefsToImplementationMappings = depDoc.ProcessTypeScriptMappingFile(depDocFilePath);
                #region process scripts
                var scriptRefs = new Dictionary<string, bool>();
                var scripts = header
                    .querySelectorAll("script")
                    .ToList();
                scripts.ForEach(s =>
                {
                    var src = s.getAttribute("src");
                    var srcLC = src.ToLower();
                    scriptRefs[src] = true;
                });
                var scriptFiles = scriptRefs.Select(typescriptRef =>
                {
                    var src = typescriptRef.Key;
                    var srcFilePath = depDocFilePath.NavigateTo(src);
                    return new ScriptFile(srcFilePath);
                }).ToList();
                var alreadyAdded = new Dictionary<string, bool>();
                var fileList = new List<ScriptFile>();
                foreach(var tsFile in scriptFiles){
                    checkScriptFileForDependencies(alreadyAdded, fileList, tsFile);
                }
                fileList.Sort();
                var rdID = rd.id;
                var previousScriptTags = doc.head.querySelectorAll("script[data-genID='" + rdID + "']");
                previousScriptTags.ForEach(pst => pst.delete());
                foreach (var scriptFile in fileList)
                {
                    #region map script files
                    var scriptFileAbsPaths = new List<string>{
                        scriptFile.DocumentFilePath,
                    };
                    if (typeDefsToImplementationMappings.ContainsKey(scriptFileAbsPaths[0]))
                    {
                        scriptFileAbsPaths = typeDefsToImplementationMappings[scriptFileAbsPaths[0]];
                    }
                    foreach (var tsFileAbsPath in scriptFileAbsPaths)
                    {
                        var scriptImport = doc.createElement("script");
                        if (isLocal)
                        {
                            var fi = new FileInfo(tsFileAbsPath);
                            if (fi.LastWriteTime > latestTimeStamp)
                            {
                                latestTimeStamp = fi.LastWriteTime;
                            }
                        }
                        var src = doc.GetHostRelativePath(tsFileAbsPath);
                        if (src.EndsWith(".ts"))
                        {
                            src = src.ReplaceLast(".ts").With(".js");
                        }
                        scriptImport.setAttribute("src", src);
                        if (!string.IsNullOrEmpty(mode))
                        {
                            scriptImport.setAttribute("data-mode", mode);
                        }
                        scriptImport.setAttribute("data-genID", rdID);
                        //doc.head.appendChild(sc);
                        doc.head.insertBefore(scriptImport, rd);
                    }
                    #endregion
                }
                #endregion
                #endregion
                #region process css
                var links = header
                    .querySelectorAll("link[rel='stylesheet']")
                    .Select(l =>
                    {
                        var href = l.getAttribute("href");
                        var hrefFilePath = depDocFilePath.NavigateTo(href);
                        return hrefFilePath;
                    })
                    .ToList();
                var previousLinkTags = doc.head.querySelectorAll("link[data-genID='" + rdID + "']");
                previousLinkTags.ForEach(plt => plt.delete());
                links.ForEach(linkAbsPath =>
                {
                    var linkImport = doc.createElement("link");
                    var fi = new FileInfo(linkAbsPath);
                    if (fi.LastWriteTime > latestTimeStamp) latestTimeStamp = fi.LastWriteTime;
                    var href = doc.GetHostRelativePath(linkAbsPath);
                    linkImport.setAttribute("href", href);
                    linkImport.setAttribute("data-genID", rdID);
                    linkImport.setAttribute("rel", "stylesheet");
                    doc.head.insertBefore(linkImport, rd);
                });
                #endregion
                rd.delete();
                var newHtml = doc.html;
                if (isLocal)
                {
                    string destFilePath = doc.Host.GetDocumentFilePath().ReplaceLast(".tsp").With(".d.tsp");
                    var destFI = new FileInfo(destFilePath);
                    if (destFI.LastWriteTime < latestTimeStamp)
                    {
                        File.WriteAllText(destFilePath, newHtml.outerHTML);
                    }
                }
                
            });
            return doc;
        }

        private static void checkScriptFileForDependencies(Dictionary<string, bool> alreadyAdded, List<ScriptFile> fileList, ScriptFile file){
            if (!alreadyAdded.ContainsKey(file.DocumentFilePath))
            {
                fileList.Add(file);
                alreadyAdded[file.DocumentFilePath] = true;
            }
            if (file.Dependencies != null)
            {
                foreach (var dep in file.Dependencies)
                {
                    checkScriptFileForDependencies(alreadyAdded, fileList, dep);
                }
            }
        
        }
    }
}
