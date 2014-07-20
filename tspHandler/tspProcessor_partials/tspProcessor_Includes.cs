using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using ClassGenMacros;

namespace tspHandler
{
    public static partial class tspProcessor
    {
        public static HtmlDocumentFacade ProcessHybridIFrames(this HtmlDocumentFacade doc)
        {
            var iframes = doc.getElementsByTagName("iframe");
            //var iframes = doc.querySelectorAll("iframe");
            doc
                .ProcessHybridIFrames(iframes)
            ;

            return doc;
        }

        private static HtmlDocumentFacade ProcessServerSideIncludes(this HtmlDocumentFacade doc)
        {
            var configSettings = System.Configuration.ConfigurationManager.GetSection(
        "tspSettingsGroup/tspSettings") as tspConfigSettings;
            var serversideIncludeTags = doc.querySelectorAll(configSettings.ServerSideIncludeSelector).ToList();
            //var serversideIframes = iframes
            //    .Where(_TestForServerSide).ToList();
            serversideIncludeTags.ForEach(includeTag =>
            {
                #region Process iframe
                var savedDom = HttpContext.Current.Items[SavedIFrameDomsKey] as Dictionary<string, HtmlDocumentFacade>;
                if (savedDom == null)
                {
                    savedDom = new Dictionary<string, HtmlDocumentFacade>();
                    HttpContext.Current.Items[SavedIFrameDomsKey] = savedDom;
                }
                var src = includeTag.getAttribute("src");
                if (src.StartsWith("'") && src.EndsWith("'"))
                {
                    //angularjs support
                    src = src.Trim('\'');
                }
                var domID = src.SubstringAfter("#");
                string selector = "#" + domID;
                if (string.IsNullOrEmpty(domID))
                {
                    string selectorTest = includeTag.getAttribute(SelectorAttribute);
                    if (string.IsNullOrEmpty(selectorTest))
                    {
                        selector = null;
                    }
                    selector = selectorTest;
                }
                src = src.SubstringBefore('#');
                string parentId = includeTag.id;
                #region GetDoc
                HtmlDocumentFacade subDoc = null;
                if (savedDom.ContainsKey(src))
                {
                    subDoc = savedDom[src];
                }
                else
                {
                    string path = src.SubstringBefore('?', '#');
                    var iframeSrcFilePath = doc.GetHostContentFilePath(path);
                    var subHandler = new tspHandler(iframeSrcFilePath);
                    subDoc = subHandler.ProcessFile();
                    savedDom[src] = subDoc;
                }
                #endregion
                var rootNode = subDoc.documentElement;
                if (!string.IsNullOrEmpty(selector))
                {
                    var matches = subDoc.querySelectorAll(selector);
                    if (matches.Count == 0)
                    {
                        throw new Exception("No Element with selector " + selector + " found.");
                    }
                    rootNode = matches[0];
                }
                #region see if this needs to be merged
                var mergeNodes = doc.ProcessContext.IFrameMergingNodes;
                if (mergeNodes != null && mergeNodes.ContainsKey(includeTag.id))
                {
                    var transformNodes = mergeNodes[includeTag.id];
                    foreach (var child in transformNodes)
                    {
                        ProcessTransform(rootNode, child);
                    }
                }


                #endregion
                #region name space all id's
                rootNode.DoForThisAndAllAncestors(node =>
                {
                    string currId = node.id;
                    if (!string.IsNullOrEmpty(currId) && !currId.StartsWith(parentId + "_"))
                    {
                        node.id = parentId + "_" + currId;
                    }
                });
                #endregion
                #region insert content
                var div = doc.createElement(rootNode.tagName.ToLower());
                foreach (var attrib in rootNode.attributes)
                {
                    div.setAttribute(attrib.name, attrib.value);
                }
                div.id = parentId;
                string parentClassName = includeTag.className;
                if (!string.IsNullOrEmpty(parentClassName)) div.className = includeTag.className;
                div.innerHTML = rootNode.innerHTML;
                var parent = includeTag.parentNode;
                parent.insertBefore(div, includeTag);
                parent.removeChild(includeTag);
                #endregion
                var header = doc.head;
                var body = doc.body;
                var fn = Fun.InferType((HtmlNodeFacade node, string attr) =>
                {
                    string iFramesrc = node.getAttribute(attr);
                    string iframeSourceFilePath = subDoc.GetHostContentFilePath(iFramesrc);
                    string relPath = doc.GetHostRelativePath(iframeSourceFilePath);
                    return relPath;
                });
                #region merge client side parentScript
                var clientSideScripts = subDoc.getElementsByTagName("script")
                    .Where(_TestForClientSide)
                    .ToList();

                clientSideScripts.ForEach(iframeClientSideScript =>
                {
                    var parentScript = doc.createElement("script");
                    if (iframeClientSideScript.hasAttribute("src"))
                    {
                        string relPath = fn(iframeClientSideScript, "src");
                        parentScript.setAttribute("src", relPath);
                    }
                    else
                    {
                        parentScript.innerHTML = iframeClientSideScript.innerHTML;
                    }
                    bool hasDefer = iframeClientSideScript.hasAttribute("defer");
                    if (hasDefer)
                    {
                        parentScript.setAttribute("defer", null);
                        body.appendChild(parentScript);
                    }
                    else
                    {
                        header.appendChild(parentScript);
                    }
                });
                #endregion
                #region merge css refs
                var links = subDoc.getElementsByTagName("link")
                    .ToList();
                links.ForEach(iframeLink =>
                {
                    var parentLink = doc.createElement("link");
                    parentLink.setAttribute("rel", "stylesheet");
                    parentLink.setAttribute("type", "text/css");
                    if (iframeLink.hasAttribute("href"))
                    {
                        string relPath = fn(iframeLink, "href");
                        parentLink.setAttribute("href", relPath);
                    }
                    else
                    {
                        parentLink.innerHTML = iframeLink.innerHTML;
                    }
                    header.appendChild(parentLink);
                });

                #endregion
                doc.CleanUpRedundantClientSideReferences();
                #endregion
            });
            return doc;
        }
    }
}
