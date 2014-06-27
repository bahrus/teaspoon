using Newtonsoft.Json;
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
                    .ProcessHybridIFrames()
                    .ProcessServerSideIncludes()
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
