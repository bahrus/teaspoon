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
                var header = depDoc.head;
                #region find type def mappings
                //var sr = new StringReader(header);
                //while (sr.Peek() != -1)
                //{
                //    var line = sr.ReadLine();
                //    if (line.Contains(MappingSeparator))
                //    {
                //        var lhs = line.SubstringBefore(MappingSeparator).Trim();
                //    }
                //}
                var children = header.childNodes;
                HtmlNodeFacade prevChild = null;
                Dictionary<string, string> typeDefsToImplementationMappings = new Dictionary<string, string>();
                bool inMiddleOfScriptMapping = false;
                foreach(var child in children){
                    if (inMiddleOfScriptMapping)
                    {
                        var lhsSrc = prevChild.getAttribute("src");
                        var rhsSrc = child.getAttribute("src");
                        typeDefsToImplementationMappings[lhsSrc] = rhsSrc;
                    }
                    if(child.tagName == "#text" && child.innerHTML=="=" && prevChild != null && prevChild.tagName=="SCRIPT"){
                        inMiddleOfScriptMapping = true;
                        continue;
                    }
                    prevChild = child;
                }
                #endregion
            });
            return doc;
        }
    }
}
