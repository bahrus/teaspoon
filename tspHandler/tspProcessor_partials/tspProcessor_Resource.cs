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
            var links = header.querySelectorAll("link[rel='jsMappings']").ToList();
            var returnObj = new Dictionary<string, List<string>>();
            foreach (var link in links)
            {
                var href = link.getAttribute("href");
                var linkFilePath = DepDocFilePath.NavigateTo(href);
                var sr = new StreamReader(linkFilePath);
                while(sr.Peek() != -1)
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
            return returnObj;

        }

        public static HtmlDocumentFacade ProcessResourceDependencies(this HtmlDocumentFacade doc)
        {
            var resourceDependencies = doc.head.querySelectorAll("link[rel='jsInclude']").ToList();
            var isLocal = HttpContext.Current.Request.IsLocal;
            resourceDependencies.ForEach(rd =>
            {
                var relPath = rd.getAttribute("href");
                string content = doc.GetHostContent(relPath);
                
                var depDoc = new HtmlDocumentFacade(content);
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
                Dictionary<string, bool> typescriptRefs = new Dictionary<string, bool>();
                var scripts = header
                    .querySelectorAll("script")
                    .ToList();
                scripts.ForEach(s =>
                {
                    var src = s.getAttribute("src");
                    if (src.ToLower().EndsWith(".ts"))
                    {
                        typescriptRefs[src] = true;
                    }
                });
                var typeScriptFiles = typescriptRefs.Select(typescriptRef =>
                {
                    var src = typescriptRef.Key;
                    var srcFilePath = depDocFilePath.NavigateTo(src);
                    return new TypescriptFile(srcFilePath);
                }).ToList();
                var alreadyAdded = new Dictionary<string, bool>();
                var fileList = new List<TypescriptFile>();
                foreach(var tsFile in typeScriptFiles){
                    ProcessTypeScriptFile(alreadyAdded, fileList, tsFile);
                }
                fileList.Sort();
                var rdID = rd.id;
                var previousScriptTags = doc.head.querySelectorAll("script[data-genID='" + rdID + "']");
                foreach (var previousScriptTag in previousScriptTags)
                {
                    previousScriptTag.delete();
                }
                foreach (var tsFile in fileList)
                {
                    
                    var tsFileAbsPaths = new List<string>{
                        tsFile.DocumentFilePath,
                    };
                    if (typeDefsToImplementationMappings.ContainsKey(tsFileAbsPaths[0]))
                    {
                        tsFileAbsPaths = typeDefsToImplementationMappings[tsFileAbsPaths[0]];
                    }
                    foreach (var tsFileAbsPath in tsFileAbsPaths)
                    {
                        var sc = doc.createElement("script");
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
                        sc.setAttribute("src", src);
                        sc.setAttribute("data-genID", rdID);
                        doc.head.appendChild(sc);
                    }
                }
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

        private static void ProcessTypeScriptFile(Dictionary<string, bool> alreadyAdded, List<TypescriptFile> fileList, TypescriptFile file){
            if (!alreadyAdded.ContainsKey(file.DocumentFilePath))
            {
                fileList.Add(file);
                alreadyAdded[file.DocumentFilePath] = true;
            }
            if (file.Dependencies != null)
            {
                foreach (var dep in file.Dependencies)
                {
                    ProcessTypeScriptFile(alreadyAdded, fileList, dep);
                }
            }
        
        }
    }
}
