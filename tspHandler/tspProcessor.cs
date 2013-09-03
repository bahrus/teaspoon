using Newtonsoft.Json;
using System;
using System.Linq;
using ClassGenMacros;
using System.Text;
using Noesis.Javascript;
using System.Web;
using System.Collections.Generic;

namespace tspHandler
{

    public static class tspProcessor
    {

        public const string ModelAttribute = "data-model";
        public const string ServerSideProcessor = "tsp-ssx";
        public const string Mode = "data-mode";
        public const string ServerSideMode = "server-side-only";
        public const string ClientSideMode = "client-side-only";
        public const string BothMode = "both";
        public const string SavedIFrameDomsKey = "SavedIFrameDomsKey";
        

        private static object InvokeServerSideMethod(string StaticMethodString, object[] args)
        {
            var typeString = StaticMethodString.SubstringBeforeLast(".").SubstringAfter("[").SubstringBeforeLast("]");
            var methodString = StaticMethodString.SubstringAfterLast(".");
            var typ = Type.GetType(typeString, true);
            var result = typ.GetMethod(methodString).Invoke(null, args);
            return result;
        }

        private static Func<HtmlNodeFacade, bool> _TestForServerSide =  node =>
        {
            string mode = node.getAttribute(Mode);
            if (string.IsNullOrEmpty(mode)) return false;
            return (mode == ServerSideMode || mode == BothMode);

        };

        private static Func<HtmlNodeFacade, bool> _TestForClientSide = node =>
        {
            string mode = node.getAttribute(Mode);
            if (string.IsNullOrEmpty(mode)) return true;
            return (mode != ServerSideMode);

        };

        public static void CleanUpRedundantClientSideReferences(this HtmlDocumentFacade doc)
        {
            var alreadyReferencedScripts = new Dictionary<string, bool>();
            var clientSideScripts = doc.getElementsByTagName("script")
                .Where(node => _TestForClientSide(node))
                .Where(node => node.hasAttribute("src"))
                .ToList();
            clientSideScripts.ForEach(clientSideScript =>
            {
                string src = clientSideScript.getAttribute("src");
                string filePath = doc.GetHostContentFilePath(src).ToLower();
                if (alreadyReferencedScripts.ContainsKey(filePath))
                {
                    clientSideScript.parentNode.removeChild(clientSideScript);
                }
                else
                {
                    alreadyReferencedScripts[filePath] = true;
                }
            });
            var alreadyReferencedCSS = new Dictionary<string, bool>();
            var cssRefs = doc.getElementsByTagName("link")
                .Where(node => node.hasAttribute("href"))
                .ToList();
            cssRefs.ForEach(cssRef =>
            {
                string href = cssRef.getAttribute("href");
                string filePath = doc.GetHostContentFilePath(href).ToLower();
                if(alreadyReferencedCSS.ContainsKey(filePath)){
                    cssRef.parentNode.removeChild(cssRef);
                }else{
                    alreadyReferencedCSS[filePath] = true;
                }
            });
        }

        public static HtmlDocumentFacade ProcessServerSideScripts(this HtmlDocumentFacade doc)
        {
            //var serverSideScripts = doc.getElementsByTagName("parentScript").Where(node =>
            //{
            //    string mode = node.getAttribute(Mode);
            //    if (string.IsNullOrEmpty(mode)) return false;
            //    return (mode == ServerSideMode || mode == BothMode);

            //});
            var serverSideScripts = doc.getElementsByTagName("script").Where(_TestForServerSide);
            var models = serverSideScripts
                .Where(node => !string.IsNullOrEmpty(node.getAttribute(ModelAttribute)))
                .ToList();
            var sb = new StringBuilder();
            models.ForEach(model => {
                var id = model.id;
                if(string.IsNullOrEmpty(id)) throw new Exception("model script tags must have an id");
                var staticMethodString = model.getAttribute(ModelAttribute);
                var result = InvokeServerSideMethod(staticMethodString, null);
                string json = JsonConvert.SerializeObject(result);
                
                string modelScript = @"
if(!model) var model = {};
model['" + id + "'] = " + json + ";";
                //sb.AppendLine(modelScript);
                model.innerHTML = modelScript;
            });
            //serverSideScripts = serverSideScripts.Where(node => string.IsNullOrEmpty(node.getAttribute(ModelAttribute)));
            var serverSideScriptsList = serverSideScripts.ToList();
            serverSideScriptsList.ForEach(node =>
            {
                string src = node.getAttribute("src");
                if (string.IsNullOrEmpty(src))
                {
                    sb.AppendLine(node.innerHTML);
                }
                else
                {
                    sb.AppendLine(doc.GetHostContent(src));
                }
                string mode = node.getAttribute(Mode);
                if (mode == ServerSideMode)
                {
                    node.parentNode.removeChild(node);
                }
            });
            string script = sb.ToString();
            if (script.Length > 0)
            {
                // Initialize a context
                //sb.AppendLine("tsp.applyRules(document);");
                script = sb.ToString();
                using (JavascriptContext context = new JavascriptContext())
                {

                    // Setting external parameters for the context
                    context.SetParameter("console", new Console());
                    context.SetParameter("document", doc);
                    //context.SetParameter("model", model);
                    context.SetParameter("mode", "server");
                    // Running the parentScript
                    context.Run(script);
                }
            }

            return doc;
        }

        public static HtmlDocumentFacade ProcessServerSideIncludes(this HtmlDocumentFacade doc)
        {
            var serversideIframes = doc.getElementsByTagName("iframe")
                .Where(_TestForServerSide).ToList();
            serversideIframes.ForEach(iframe =>
            {
                #region Process iframe
                var savedDom = HttpContext.Current.Items[SavedIFrameDomsKey] as Dictionary<string, HtmlDocumentFacade>;
                if (savedDom == null)
                {
                    savedDom = new Dictionary<string, HtmlDocumentFacade>();
                    HttpContext.Current.Items[SavedIFrameDomsKey] = savedDom;
                }
                var src = iframe.getAttribute("src");
                var domID = src.SubstringAfter("#");
                if (string.IsNullOrEmpty(domID)) throw new Exception("No id found in src url"); //TODO:  give more info
                src = src.SubstringBefore('#');
                string parentId = iframe.id;
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
                #region name space all id's
                var el = subDoc.getElementById(domID);
                el.DoForThisAndAllAncestors(node =>
                {
                    string currId = node.id;
                    if (!string.IsNullOrEmpty(currId) && !currId.StartsWith(parentId + "_"))
                    {
                        node.id = parentId + "_" + currId;
                    }
                });
                #endregion
                #region insert content
                var div = doc.createElement("div");
                div.id = parentId;
                string parentClassName = iframe.className;
                if(!string.IsNullOrEmpty(parentClassName)) div.className = iframe.className;
                div.innerHTML = el.innerHTML;
                var parent = iframe.parentNode;
                parent.insertBefore(div, iframe);
                parent.removeChild(iframe);
                #endregion
                var header = doc.getElementsByTagName("head")[0];
                var body = doc.getElementsByTagName("body")[0];
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

        public static HtmlDocumentFacade RetrieveContext(this HtmlDocumentFacade doc)
        {
            //TODO:  Implement
            return doc;
        }

        //public static HtmlDocumentFacade PerformServerSideProcessing(this HtmlDocumentFacade doc)
        //{
        //    var relevantStyles = doc.styleSheets
        //        .SelectMany(ss => ss.rules)
        //        .Where(rule => rule.style.ContainsKey(ServerSideProcessor));
        //    relevantStyles.ToList().ForEach(rule =>
        //    {
        //        string staticMethodString = rule.style[ServerSideProcessor];
        //        InvokeServerSideMethod(staticMethodString, new object[] { rule, doc });
        //    });
        //    return doc;
        //}

    }

    
}
