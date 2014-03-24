using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using ClassGenMacros;

namespace tspHandler
{
    public static partial class tspProcessor
    {

        public const string MappingSeparator = "<-->";

        public static HtmlDocumentFacade ProcessResourceDependencies(this HtmlDocumentFacade doc)
        {
            var resourceDependencies = doc.querySelectorAll("iframe[data-resource]").ToList();
            resourceDependencies.ForEach(rd =>
            {
                var relPath = rd.getAttribute("src");
                string content = doc.GetHostContent(relPath);
                
                var depDoc = new HtmlDocumentFacade(content);
                var depDocFilePath = doc.GetHostContentFilePath(relPath);
                var header = depDoc.head;
                #region find type def mappings
                
                var children = header.childNodes;
                Dictionary<string, string> typeDefsToImplementationMappings = new Dictionary<string, string>();
                Dictionary<string, bool> typescriptRefs = new Dictionary<string, bool>();
                int childrenLen = children.Count;
                for (var i = 0; i < childrenLen; i++)
                {
                    #region read script tag
                    var child = children[i];
                    if (child.tagName == "SCRIPT")
                    {
                        if (
                            (i + 2 < childrenLen)
                            && children[i + 1].tagName == "#text"
                            && children[i + 1].innerHTML == "="
                            && children[i + 2].tagName == "SCRIPT"
                        )
                        {
                            var lhsSrc = child.getAttribute("src");
                            var rhsSrc = children[i + 2].getAttribute("src");
                            typeDefsToImplementationMappings[lhsSrc] = rhsSrc;
                        }
                        else
                        {
                            string src = child.getAttribute("src");
                            if (src.EndsWith(".ts"))
                            {
                                typescriptRefs[src] = true;
                            }
                        }
                    }
                    #endregion
                }
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
                    var sc = doc.createElement("script");
                    var src = doc.GetHostRelativePath(tsFile.DocumentFilePath);
                    sc.setAttribute("src", src);
                    sc.setAttribute("data-genID", rdID);
                    doc.head.appendChild(sc);
                }
                #endregion

                rd.delete();
                var newHtml = doc.html;
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
                //file.Dependencies = null;
            }
        
        }
    }
}
