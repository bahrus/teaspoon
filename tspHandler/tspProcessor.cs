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
        public const string ModeAttribute = "data-mode";
        public const string DesignTypeAttribute = "data-design-type";

        public const string modeParameter = "mode";
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
            string mode = node.getAttribute(ModeAttribute);
            if (string.IsNullOrEmpty(mode)) return false;
            return (mode == ServerSideMode || mode == BothMode);

        };

        private static Func<HtmlNodeFacade, bool> _TestForClientSide = node =>
        {
            string mode = node.getAttribute(ModeAttribute);
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

        
        public static HtmlDocumentFacade DisplayDesignMode(this HtmlDocumentFacade doc)
        {
            #region get all form elements and display them only
            doc.body.DoForThisAndAllAncestors(nd =>{
                switch (nd.tagName)
                {
                    case "body":
                    case "form":
                    case "script":
                    case "#text":
                    case "datalist":
                    case "option":
                    case "textarea":
                        break;
                    case "input":
                        if (nd.type == "hidden")
                        {
                            var designType = nd.getAttribute(DesignTypeAttribute);
                            if (string.IsNullOrEmpty(designType))
                            {
                                nd.type = "text";
                            }
                            else
                            {
                                switch (designType)
                                {
                                    case "datalist":
                                        nd.removeAttribute("type");
                                        break;
                                        
                                }
                            }
                        }
                        var p = nd.parentNode;
                        var label = doc.createElement("label");
                        label.innerHTML = nd.name + ": ";
                        p.insertBefore(label, nd);
                        var lineBr = doc.createElement("br");
                        p.insertAfter(lineBr, nd);
                        break;
                    default:
                        nd.delete();
                        break;
                }
            });
            
            #endregion
            return doc;
        }

        #region Process Methods
        public static void Process(this HtmlDocumentFacade doc)
        {
            ProcessEmmetSpaces(doc);
            ProcessServerSideForms(doc);
            if (doc.Host.IsDesignMode())
            {
                ProcessServerSideScripts(doc);
                DisplayDesignMode(doc);
                return;
            }
            else
            {
                ProcessServerSideIncludes(doc);
                ProcessServerSideScripts(doc);
            }
            
        }

        public static HtmlDocumentFacade ProcessEmmetSpaces(this HtmlDocumentFacade doc)
        {
            var emmetTagsWithSpaces = doc.querySelectorAll("script.emmet.withSpaces").ToList();
            emmetTagsWithSpaces.ForEach(node =>
            {
                string content = node.innerHTML.Trim();
                content = content.RemoveWhiteSpaceOutsideGroupings(new char[] { '{' }, new char[] { '}' });
                node.innerHTML = content;
            });
            return doc;
        }

        public static HtmlDocumentFacade ProcessServerSideForms(this HtmlDocumentFacade doc)
        {
            var serversideForms = doc.getElementsByTagName("form")
                .Where(_TestForServerSide).ToList();
            if (serversideForms.Count == 0) return doc;
            var context = doc.createElement("script");
            //<script data-model= data-mode="both" id="context"></script>
            context.setAttribute("data-model", "[tsp.Http].GetContext");
            context.setAttribute(ModeAttribute, BothMode);
            context.id = "httpContext";
            var head = doc.head;
            head.appendChild(context);
            var autoFill = doc.createElement("script");
            autoFill.setAttribute(ModeAttribute, ServerSideMode);
            autoFill.innerHTML = @"
tsp.createInputAutoFillRule(model);
";
            head.appendChild(autoFill);
            var inputs = doc.querySelectorAll("input[type='submit']");
            var reqParams = HttpContext.Current.Request.QueryString;
            inputs.ToList().ForEach(input =>
            {
                var name = input.name;
                var reqVal = reqParams[name];
                if (reqVal != null)
                {
                    if (reqVal == input.value)
                    {
                        input.setAttribute("data-eventName", "clicked");
                    }
                }
            });
            return doc;
        }

        public static HtmlDocumentFacade ProcessServerSideScripts(this HtmlDocumentFacade doc)
        {
            //var serverSideScripts = doc.getElementsByTagName("parentScript").Where(node =>
            //{
            //    string mode = node.getAttribute(ModeAttribute);
            //    if (string.IsNullOrEmpty(mode)) return false;
            //    return (mode == ServerSideMode || mode == BothMode);

            //});
            var serverSideScripts = doc.getElementsByTagName("script").Where(_TestForServerSide);
            var models = serverSideScripts
                .Where(node => !string.IsNullOrEmpty(node.getAttribute(ModelAttribute)))
                .ToList();
            var sb = new StringBuilder();
            models.ForEach(model =>
            {
                var id = model.id;
                if (string.IsNullOrEmpty(id)) throw new Exception("model script tags must have an id");
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
                string mode = node.getAttribute(ModeAttribute);
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
                    var jqueryFacade = new JQueryFacade(doc);
                    context.SetParameter("jQueryServerSideFacade", jqueryFacade);
                    context.SetParameter(modeParameter, "server");
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
                var div = doc.createElement(el.tagName);
                foreach (var attrib in el.attributes)
                {
                    div.setAttribute(attrib.name, attrib.value);
                }
                div.id = parentId;
                string parentClassName = iframe.className;
                if(!string.IsNullOrEmpty(parentClassName)) div.className = iframe.className;
                div.innerHTML = el.innerHTML;
                var parent = iframe.parentNode;
                parent.insertBefore(div, iframe);
                parent.removeChild(iframe);
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

        #endregion
        

        

    }

    
}
