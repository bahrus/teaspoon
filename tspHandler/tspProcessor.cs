﻿using Newtonsoft.Json;
using System;
using System.Linq;
using ClassGenMacros;
using System.Text;
using System.Web;
using System.Collections.Generic;
using System.Dynamic;
using Newtonsoft.Json.Linq;


namespace tspHandler
{

    public static partial class tspProcessor
    {

        public const string ModelAttribute = "data-model";
        public const string CSFilterAttribute = "data-csFilter";

        public const string ModeAttribute = "data-mode";
        public const string DesignTypeAttribute = "data-design-type";
        public const string SSFormatAttribute = "data-model-ssFormat";
        public const string SelectorAttribute = "data-selector";
        public const string CompilerAttribute = "data-compiler";
        public const string TransformAttribute = "data-transform";
        public const string AttributeLinkAttribute = "data-attribute-link";

        public const string XMatchAttribute = "data-xmatch";

        public const string modeParameter = "mode";
        public const string ServerSideMode = "server-side-only";
        public const string ClientSideMode = "client-side-only";

        public const string BothMode = "both";
        public const string HybridMode = "hybrid";
        public const string DependsMode = "depends";
        public const string NoneMode = "none";

        public const string SavedIFrameDomsKey = "SavedIFrameDomsKey";
        public const string DBS_Attr = "DBS.Attr";
        

        public static object InvokeServerSideMethod(string StaticMethodString, object[] args)
        {
            if (StaticMethodString == "DBS.Http.GetContext")
            {
                return Http.GetContextFacade();
            }
            var typeString = StaticMethodString.SubstringBeforeLast(".").SubstringAfter("[").SubstringBeforeLast("]");
            var methodString = StaticMethodString.SubstringAfterLast(".");
            var typ = Type.GetType(typeString, true);
            var mthd = typ.GetMethod(methodString);
            if(mthd == null){
                throw new NotImplementedException("Method " + methodString + " not found in " + typ.FullName);
            }
            var result = mthd.Invoke(null, args);
            return result;
        }

        private static Modes GetMode(HtmlNodeFacade node)
        {
            string mode = node.getAttribute(ModeAttribute);
            string tagName = node.tagName.ToLower();
            if (string.IsNullOrEmpty(mode))
            {
                switch (tagName)
                {
                    case "script":
                        string type = node.getAttribute("type");
                        if (!string.IsNullOrEmpty(type) && (type.ToLower() == "text/html" || type.ToLower() == "text/emmet"))
                        {
                            return Modes.ClientSideOnly;
                        }
                        //if (string.IsNullOrEmpty(mode)) redundant
                        {
                            string model = node.getAttribute(ModelAttribute);
                            return string.IsNullOrEmpty(model) ? Modes.ClientSideOnly : Modes.Both;
                        }
                    case "iframe":
                        return Modes.ClientSideOnly;
                    case "style":
                        return Modes.Unspecified;
                    case "form":
                        return Modes.ServerSideOnly;
                    default:
                        return Modes.ClientSideOnly;
                }
            }
            switch (mode)
            {
                case ClientSideMode:
                    return Modes.ClientSideOnly;
                case ServerSideMode:
                    return Modes.ServerSideOnly;
                case BothMode:
                    return Modes.Both;
                case HybridMode:
                    return Modes.Hybrid;
                case DependsMode:
                    return Modes.Depends;
                case NoneMode:
                    return Modes.None;
                default:
                    throw new NotSupportedException("Mode " + mode + " not supported");

            }
            
        }

        private static Func<HtmlNodeFacade, bool> _TestForServerSide =  node =>
        {
            var mode = GetMode(node);
            switch (mode)
            {
                case Modes.Both:
                case Modes.ServerSideOnly:
                    return true;
                case Modes.Depends:
                    throw new NotSupportedException();
                default:
                    return false;
            }

        };

        private static Func<HtmlNodeFacade, bool> _TestForRealScript = node =>
        {
            var typ = node.getAttribute("type");
            if(string.IsNullOrEmpty(typ)) return true;
            typ = typ.ToLower();
            switch(typ){
                case "text/javascript":
                case "text/ecmascript":
                case "application/ecmascript":
                case "application/javascript":
                    return true;
                default:
                    return false;
            }
        };

        private static Func<HtmlNodeFacade, bool> _TestForNoSide = node =>
        {
            var mode = GetMode(node);
            return mode == Modes.None;
        };

        private static Func<HtmlNodeFacade, bool> _TestForServerSideOnly = node =>
        {
            var mode = GetMode(node);
            switch (mode)
            {
                case Modes.ServerSideOnly:
                    return true;
                case Modes.Depends:
                    throw new NotImplementedException();
                default:
                    return false;
            }
        };

        private static Func<HtmlNodeFacade, bool> _TestForClientSideOnly = node =>
        {
            var mode = GetMode(node);
            switch (mode)
            {
                case Modes.ClientSideOnly:
                    return true;
                case Modes.Depends:
                    throw new NotImplementedException();
                default:
                    return false;
            }
        };

        private static Func<HtmlNodeFacade, bool> _TestForHybridMode = node =>
        {
            var mode = GetMode(node);
            return mode == Modes.Hybrid;
        };

        private static Func<HtmlNodeFacade, bool> _TestForClientSide = node =>
        {
            var mode = GetMode(node);
            switch (mode)
            {
                case Modes.Both:
                case Modes.ClientSideOnly:
                    return true;
                case Modes.Depends:
                    throw new NotSupportedException();
                default:
                    return false;
            }

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
                switch (nd.tagName.ToLower())
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

        public static void Trace(this HtmlDocumentFacade doc, string key)
        {
            if (!doc.Host.IsTraceMode()) return;
            var nd = DateTime.Now;
            HttpContext.Current.Response.AddHeader(key, (nd.Ticks / 10000000d).ToString());
        }


        #region Process Methods
        public static HtmlDocumentFacade Process(this HtmlDocumentFacade doc)
        {
            Trace(doc, "ProcessDifferences");
            var mergedDoc = ProcessDifferences(doc);
            if (mergedDoc != null) return mergedDoc;
            Trace(doc, "ProcessEmmetSpaces");
            //ProcessEmmetSpaces(doc);
            doc
                .ProcessEmmetSpaces()
                .ProcessResourceDependencies()
                .ProcessStyleDirectives()
                .ProcessServerSideForms()
            ;
            
            if (doc.Host.IsDesignMode())
            {
                doc
                    .ProcessModelScriptTags()
                    .ProcessServerSideScripts()
                    .DisplayDesignMode()
                    .PostProcessModel()
                ;
            }
            else
            {
                doc
                    .ProcessModelScriptTags()
                    .ProcessSpecialTemplates()
                    .ProcessIFrames()
                    .ProcessServerSideScripts()
                    .ProcessLazyElements()
                    .PostProcessModel()
                    .RemoveServerSideOnlyCSSAttributes()
                ;
            }
            Trace(doc, "EndProcess");
            return doc;
        }


        

        
        private const string Lambda = "=>";

        private static string convertLambdaExpressionToFunction(string expression)
        {
            if (!expression.Contains(Lambda)) return expression;
            string LHS = expression.SubstringBefore(Lambda).Trim();
            if (!LHS.StartsWith("(") || !LHS.EndsWith(")")) return expression;
            string RHS = expression.SubstringAfter(Lambda).Trim();
            return "function" + LHS + "{ return " + RHS + ";}";
        }

        

        public static HtmlDocumentFacade ProcessTSPStyles(this HtmlDocumentFacade doc){
            var tspStyles = doc.querySelectorAll("style[data-js-compiler='tsp.script-rules']").ToList();
            tspStyles.ForEach(node =>
            {
                string content = node.innerHTML.Trim();
                var styleSheet = HtmlDocumentFacade.processCssContent(content);
                var sb = new StringBuilder();
                sb.AppendLine("");
                var first = true;
                foreach (var rule in styleSheet.rules)
                {
                    if (first)
                    {
                        sb.Append("tsp");
                        first = false;
                    }
                    else
                    {
                        sb.Append("})");
                    }
                    sb.AppendLine("._if('" + rule.selectorText + "', {");
                    foreach (var kvp in rule.style)
                    {
                        sb.AppendLine("\t'" + kvp.Key + "': " + convertLambdaExpressionToFunction( kvp.Value ) + ",");
                    }
                    
                }
                sb.AppendLine("});");
                var mode = node.getAttribute("data-mode");
                var newNode = doc.createElement("script");
                if (!string.IsNullOrEmpty(mode))
                {
                    newNode.setAttribute("data-mode", mode);
                }
                //newNode.setAttribute("defer", null);
                var script = sb.ToString();
                newNode.innerHTML = script;
                node.parentNode.insertBefore(newNode, node);
                node.parentNode.removeChild(node);
            });
            return doc;
        }

        public static HtmlDocumentFacade ProcessTCPStyles(this HtmlDocumentFacade doc)
        {
            var tcpStyles = doc.querySelectorAll("style[data-js-compiler='tsp.event-handlers']").ToList();
            tcpStyles.ForEach(node =>
            {
                string content = node.innerHTML.Trim();
                var styleSheet = HtmlDocumentFacade.processCssContent(content);
                var sb = new StringBuilder();
                sb.AppendLine(string.Empty);
                foreach (CssRule rule in styleSheet.rules)
                {
                    sb.AppendLine("tcp._when('" + rule.style["event"] + "', {");
                    sb.AppendLine("\tselectorNodeTest: '" + rule.selectorText + "',");
                    sb.AppendLine("\thandler:" + rule.style["handler"]);
                    sb.AppendLine("});");
                }
                var newNode = doc.createElement("script");
                var script = sb.ToString();
                newNode.innerHTML = script;
                node.parentNode.insertBefore(newNode, node);
                node.parentNode.removeChild(node);
            });
            return doc;
        }

        public static HtmlDocumentFacade ProcessSpecialTemplates(this HtmlDocumentFacade doc)
        {
            var templates = doc.querySelectorAll("script[type='text/html']");
            doc
                .ProcessMergingIFrames(templates)
            ;
            return doc;
        }

        public static HtmlDocumentFacade ProcessMergingIFrames(this HtmlDocumentFacade doc, List<HtmlNodeFacade> templates)
        {
            var dataTransformTemplates = templates
                .Where(node =>
                {
                    return node.hasAttribute(TransformAttribute);
                }).ToList();
            foreach (var dataTransform in dataTransformTemplates)
            {

                string innerHTML = dataTransform.innerHTML;
                string iFrameTag = innerHTML.SubstringBetween("<iframe").Inclusive().And("</iframe>");
                dataTransform.insertAdjacentHTML("beforebegin", iFrameTag);
                var iFrameNode = dataTransform.previousSibling;
                if (string.IsNullOrEmpty(iFrameNode.id))
                {
                    throw new Exception("Merging iframe must have an ID");
                }
                string rest = innerHTML.Replace(iFrameTag, "").Trim();
                var div = doc.createElement("div");
                div.innerHTML = rest;
                doc.ProcessContext.IFrameMergingNodesNN[iFrameNode.id] = div.childNodes;
                dataTransform.delete();
            }
            return doc;
        }

        

        

        //public static HtmlDocumentFacade ProcessDBSAttrCompilerTags(this HtmlDocumentFacade doc)
        //{
        //    var DBSAttrCompilerTags = doc.getElementsByTagName("style")
        //        .Where(node =>
        //        {
        //            string compiler = node.getAttribute(CompilerAttribute);
        //            if (string.IsNullOrEmpty(compiler)) return false;
        //            switch (compiler)
        //            {
        //                case DBS_Attr:
        //                    return true;
        //                default:
        //                    return false;
        //            }
        //        });
            
        //    return doc;
        //}

        

        private static HtmlDocumentFacade ProcessServerSideIFrames(this HtmlDocumentFacade doc, List<HtmlNodeFacade> iframes)
        {
            var serversideIframes = iframes
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
                string selector = "#" + domID;
                if (string.IsNullOrEmpty(domID))
                {
                    string selectorTest = iframe.getAttribute(SelectorAttribute);
                    if (string.IsNullOrEmpty(selectorTest))
                    {
                        throw new Exception("No selector specified for iframe with id " + iframe.id);
                    }
                    selector = selectorTest;
                }
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
                var matches = subDoc.querySelectorAll(selector);
                if(matches.Count == 0){
                    throw new Exception("No Element with selector " + selector + " found.");
                }
                var el = matches[0];
                #region see if this needs to be merged
                var mergeNodes = doc.ProcessContext.IFrameMergingNodes;
                if (mergeNodes != null && mergeNodes.ContainsKey(iframe.id))
                {
                    var transformNodes = mergeNodes[iframe.id];
                    foreach(var child in transformNodes){
                        ProcessTransform(el, child);
                    }
                }
                
                
                #endregion
                #region name space all id's
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
                var div = doc.createElement(el.tagName.ToLower());
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

        private static HtmlDocumentFacade ProcessHybridIFrames(this HtmlDocumentFacade doc, List<HtmlNodeFacade> iframes)
        {
            var hybridIframes = iframes
                .Where(_TestForHybridMode).ToList();
            hybridIframes.ForEach(iframe =>
            {
                #region process iframe
                var iframeID = iframe.id;
                if (string.IsNullOrEmpty(iframeID))
                {
                    throw new Exception("Hybrid IFrames must have an id");
                }
                var divPlaceHolder = doc.createElement("div");
                divPlaceHolder.id = iframeID;
                divPlaceHolder.setAttribute("src", iframe.getAttribute("src"));
                //divPlaceHolder.innerHTML = "tempDivPlaceHolder";
                var par = iframe.parentNode;
                par.insertBefore(divPlaceHolder, iframe);
                
                var iframeScript = doc.createElement("script");
                iframeScript.innerHTML = @"
DBS.cs.mergeHybridIframe({
    destID : '" + iframeID + @"'
});
";
                par.insertBefore(iframeScript, iframe);
                par.removeChild(iframe);
                #endregion
            });
            return doc;
        }
     
        public static HtmlDocumentFacade ProcessIFrames(this HtmlDocumentFacade doc)
        {
            var iframes = doc.getElementsByTagName("iframe");
            //var iframes = doc.querySelectorAll("iframe");
            doc
                .ProcessServerSideIFrames(iframes)
                .ProcessHybridIFrames(iframes)
            ;
            
            return doc;
        }

        #endregion
        

        

    }


    public class NodeDifference
    {
        //public NodeDifference Context { get; set; }

        //private NodeDifference _parent { get; set; }

        public string MatchSelector { get; set; }

        public List<NodeDifference> Children { get; set; }

        public HtmlNodeFacade Node { get; set; }

        public NodeDiffAction Action { get; set; }
    }

    public enum NodeDiffAction
    {
        Append,
        Remove,
        RemoveChildren,
        Replace,
        ReplaceAttributes,
    }

    public enum Modes
    {
        ClientSideOnly,
        ServerSideOnly,
        Both,
        Hybrid,
        Depends,
        Unspecified,
        None,
    }

    public class ModelContext
    {
        public JObject JSONObject { get; set; }
    }

    public class StyleDirectiveContext
    {
        public Dictionary<HtmlNodeFacade, List<HtmlNodeFacade>> OutputNodes{get;set;}
        public Dictionary<HtmlNodeFacade, Action<HtmlNodeFacade>> ElementActions{get;set;}

        public StyleDirectiveContext()
        {
            this.OutputNodes = new Dictionary<HtmlNodeFacade, List<HtmlNodeFacade>>();
            this.ElementActions = new Dictionary<HtmlNodeFacade, Action<HtmlNodeFacade>>();
        }
    }
    
}
