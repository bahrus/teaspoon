using Newtonsoft.Json;
using System;
using System.Linq;
using ClassGenMacros;
using System.Text;
using System.Web;
using System.Collections.Generic;
using System.Dynamic;
using Microsoft.ClearScript.V8;
using Newtonsoft.Json.Linq;


namespace tspHandler
{

    public static class tspProcessor
    {

        public const string ModelAttribute = "data-model";
        public const string CSFilterAttribute = "data-csFilter";

        public const string ModeAttribute = "data-mode";
        public const string DesignTypeAttribute = "data-design-type";
        public const string SSFormatAttribute = "data-model-ssFormat";
        public const string CompilerAttribute = "data-compiler";

        public const string modeParameter = "mode";
        public const string ServerSideMode = "server-side-only";
        public const string ClientSideMode = "client-side-only";
        public const string BothMode = "both";
        public const string HybridMode = "hybrid";
        public const string DependsMode = "depends";
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
                        if (string.IsNullOrEmpty(mode))
                        {
                            string model = node.getAttribute(ModelAttribute);
                            return string.IsNullOrEmpty(model) ? Modes.ClientSideOnly : Modes.Both;
                        }
                        break;
                    case "iframe":
                        return Modes.ClientSideOnly;
                    case "style":
                        return Modes.Unspecified;
                    case "form":
                        return Modes.ServerSideOnly;
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
                .ProcessStyleDirectives()
                .ProcessServerSideForms()
            ;
            //Trace(doc, "ProcessTSPStyles");
            //ProcessTSPStyles(doc);
            //Trace(doc, "ProcessTCPStyles");
            //ProcessTCPStyles(doc);
            Trace(doc, "ProcessServerSideForms");
            ProcessServerSideForms(doc);
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
                    .ProcessIFrames()
                    .ProcessServerSideScripts()
                    .PostProcessModel()
                ;
            }
            Trace(doc, "EndProcess");
            return doc;
        }

        #region Process Differences

        public static HtmlDocumentFacade ProcessDifferences(HtmlDocumentFacade doc)
        {
            var urlSource = HttpContext.Current.Request["tsp-src"];
            if (urlSource != null)
            {
                return null;
            }
            HtmlDocumentFacade diffDoc = doc;
            doc.Trace("begindocInherits");
            var docInherits = doc.querySelectorAll("html>head>meta[name='inherits']");
            doc.Trace("enddocInherits");
            if (docInherits.Count == 0) return null;
            if (docInherits.Count > 1)
            {
                throw new ArgumentException("Cannot inherit from more than one page");
            }
            var metaEl = docInherits[0];
            var baseDocRelativeURL = metaEl.getAttribute("content");
            if (string.IsNullOrEmpty(baseDocRelativeURL)) throw new ArgumentException("No Content Attribute found");
            var inheritedContentFilePath = doc.GetHostContentFilePath(baseDocRelativeURL);
            var superHandler = new tspHandler(inheritedContentFilePath);
            HtmlDocumentFacade superDoc = superHandler.ProcessFile();
            
            //var nodeDiffs = new NodeDifference();
            var nodeHierarchy = new Stack<HtmlNodeFacade>();
            nodeHierarchy.Push(diffDoc.html);
            var differenceStack = new Stack<NodeDifference>();
            var differences = new List<NodeDifference>();
            ProcessNode(nodeHierarchy, differenceStack, differences);
            MergeDifferences(superDoc, differences);
            return superDoc;
        }

        private static void ProcessNode(Stack<HtmlNodeFacade> nodeHierarchy, Stack<NodeDifference> differenceStack, List<NodeDifference> result)
        {
            var currNode = nodeHierarchy.Peek();
            if (currNode.tagName == "#text") return;
            var merge = currNode.getAttribute("data-xmerge");
            if (string.IsNullOrEmpty(merge))
            {
                foreach (var child in currNode.ChildNodes)
                {
                    nodeHierarchy.Push(child);
                    ProcessNode(nodeHierarchy, differenceStack, result);
                    nodeHierarchy.Pop();
                }
            }
            else
            {
                var selector = getSelector(nodeHierarchy);

                var ndDiff = new NodeDifference
                {
                    Node = currNode,
                    Action = (NodeDiffAction)Enum.Parse(typeof(NodeDiffAction), merge),
                };
                if (differenceStack.Count > 0)
                {
                    var parent = differenceStack.Peek();
                    selector = selector.Substring(parent.MatchSelector.Length);
                    if (parent.Children == null) parent.Children = new List<NodeDifference>();
                    parent.Children.Add(ndDiff);
                }
                else
                {
                    result.Add(ndDiff);
                }
                ndDiff.MatchSelector = selector;
                differenceStack.Push(ndDiff);
                foreach (var child in currNode.ChildNodes)
                {
                    nodeHierarchy.Push(child);
                    ProcessNode(nodeHierarchy, differenceStack, result);
                }
                differenceStack.Pop();

            }
        }


        private static void MergeDifferences(INodeSelector source, List<NodeDifference> differences)
        {
            foreach (var diff in differences)
            {
                string selector = Fun.Val(() =>
                {
                    switch (diff.Action)
                    {
                        case NodeDiffAction.Append:
                            return diff.MatchSelector.SubstringBeforeLast(">");
                            break;
                        default:
                            throw new Exception();
                    }
                });
                var nodes = source.querySelectorAll(selector);
                if (nodes.Count != 1)
                {
                    throw new Exception("No Matching Single Node Found: " + diff.MatchSelector);
                }
                var node = nodes[0];
                switch (diff.Action)
                {
                    case NodeDiffAction.Append:
                        node.parentNode.appendChild(diff.Node);
                        break;
                    default:
                        throw new NotImplementedException();
                }
                if (diff.Children != null)
                {
                    MergeDifferences(node, diff.Children);
                }
            }
        }

        #endregion

        private static string getSelector(Stack<HtmlNodeFacade> nodeHierarchy)
        {
            var lst = nodeHierarchy.ToList()
                .Select(nd =>
                {
                    string tagSelector = nd.tagName + nd.getAttribute("xmatch");
                    return tagSelector;
                });
              return string.Join(">", lst.Reverse().ToArray());
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

        private static List<HtmlNodeFacade> ProcessDBSAttr(StyleSheet sSheet, HtmlNodeFacade node)
        {
            foreach (var rule in sSheet.rules)
            {
                var els = node.ownerDocument.querySelectorAll(rule.selectorText);
                foreach (var el in els)
                {

                }
            }
        }
    
        public static HtmlDocumentFacade ProcessStyleDirectives(this HtmlDocumentFacade doc)
        {
            var styleDirectiveRules = doc.querySelectorAll("style[" + CompilerAttribute + "]").ToList();
            styleDirectiveRules.ForEach(node =>
            {
                string content = node.innerHTML.Trim();
                var styleSheet = HtmlDocumentFacade.processCssContent(content);
                string serversideMethodString = node.getAttribute(CompilerAttribute);
                if (serversideMethodString == DBS_Attr)
                {
                    ProcessDBSAttr(styleSheet, node);
                    return;
                }
                else
                {
                    var result = InvokeServerSideMethod(serversideMethodString, new object[] { styleSheet, node }) as List<HtmlNodeFacade>;
                    bool containsOriginalNode = false;
                    var parent = node.parentNode;
                    foreach (var newNode in result)
                    {
                        if (newNode == node)
                        {
                            containsOriginalNode = true;
                            continue;
                        }
                        else
                        {
                            parent.insertAfter(newNode, node);
                        }

                    }
                    if (!containsOriginalNode)
                    {
                        parent.removeChild(node);
                    }
                }
            });
            return doc;
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

        public static HtmlDocumentFacade ProcessEmmetSpaces(this HtmlDocumentFacade doc)
        {
            var emmetTagsWithSpaces = doc.querySelectorAll("script[type='text/emmet']").ToList();
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
            //TODO:  don't hard code this
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

        public static HtmlDocumentFacade ProcessModelScriptTags(this HtmlDocumentFacade doc)
        {
            var models = doc.getElementsByTagName("script")
                .Where(node => !string.IsNullOrEmpty(node.getAttribute(ModelAttribute)))
                .ToList();
            bool addedInitializer = false;
            models.ForEach(model =>
            {
                var id = model.id;
                if (string.IsNullOrEmpty(id)) throw new Exception("model script tags must have an id");
                var postProcessModelInfo = new ModelScriptPostProcessingInfo
                {
                    Node = model,
                    CSFilter = model.getAttribute(CSFilterAttribute),
                };
                doc.ProcessContext.ModelScriptPostProcessingInfosNN.Add(postProcessModelInfo);
                var mode = GetMode(model);
                #region see if there's a client side representation for model.  
                switch (mode)
                {
                    case Modes.Both:
                    case Modes.ClientSideOnly:
                        postProcessModelInfo.NeededForClient = true;
                        break;
                }
                #endregion
                var staticMethodString = model.getAttribute(ModelAttribute);
                switch (mode)
                {
                    case Modes.Both:
                    case Modes.ServerSideOnly:
                        #region model needed for server side processing
                        string ssFormat = model.getAttribute(SSFormatAttribute);
                        bool isDumbedDown = false;
                        if (!string.IsNullOrEmpty(ssFormat))
                        {
                            if (ssFormat != "JSON") throw new NotSupportedException(ssFormat + " not supported for attribute " + SSFormatAttribute);
                            isDumbedDown = true;
                        }
                        
                        var result = InvokeServerSideMethod(staticMethodString, null);
                        if (isDumbedDown)
                        {
                            #region Dumbed Down -- convert server side object to json
                            string json = JsonConvert.SerializeObject(result);
                            if (postProcessModelInfo.NeededForClient)
                            {
                                postProcessModelInfo.JSONifiedModel = json;
                                postProcessModelInfo.IsDumbedDown = true;
                            }
                            string initializer = addedInitializer ? null : @"
        if(typeof(model)=='undefined') model = {};";
                            string modelScript = @"
        model['" + id + "'] = " + json + @";
";
                            model.innerHTML = initializer + modelScript;
                            addedInitializer = true;
                            #endregion
                        }
                        else
                        {
                            if (doc.ProcessContext.Model == null) doc.ProcessContext.Model = new ExpandoObject();
                            var dict = (IDictionary<string, object>)doc.ProcessContext.Model;
                            dict[id] = result;
                            postProcessModelInfo.Model = result;
                            model.innerHTML = string.Empty;
                        }
                        break;
                        #endregion
                    case Modes.ClientSideOnly:
                        postProcessModelInfo.StaticMethodString = staticMethodString;
                        break;
                }
                
                model.removeAttribute(ModelAttribute);
                
            });
            return doc;
        }

        public static HtmlDocumentFacade PostProcessModel(this HtmlDocumentFacade doc)
        {
            if (doc.ProcessContext.ModelScriptPostProcessingInfos == null) return doc;
            bool addedInitializer = false;
            foreach (var modelProcessingInfo in doc.ProcessContext.ModelScriptPostProcessingInfos)
            {
                var node = modelProcessingInfo.Node;
                if (!modelProcessingInfo.NeededForClient && node.parentNode != null) //may have already been removed from doc in process server side scripts
                {
                    node.parentNode.removeChild(node);
                    continue;
                }
                else if (modelProcessingInfo.IsDumbedDown)
                {
                    continue;
                }
                var hasAsync = node.hasAttribute("async");
                string id = node.id;
                if (hasAsync)
                {
                    var server = HttpContext.Current.Server;
                    if (modelProcessingInfo.Model == null)
                    {
                        string src = "model.tsp.js?" + tspModelHandler.getMethod + "=" + server.UrlEncode(modelProcessingInfo.StaticMethodString) + "&" + tspModelHandler.id + "=" + server.UrlEncode(id);
                        node.innerHTML = string.Empty;
                        node.setAttribute("src", src);
                    }
                    else
                    {
                        throw new NotImplementedException();
                    }
                }
                else
                {
                    #region embed JSON data in tag
                    if(modelProcessingInfo.Model == null){
                        var result = InvokeServerSideMethod(modelProcessingInfo.StaticMethodString, null);
                        modelProcessingInfo.Model = result;
                    }
                    //string 
                    string json = null;
                    var jsonObj = JObject.FromObject(modelProcessingInfo.Model);
                    var csFilter = modelProcessingInfo.CSFilter;
                    if (!string.IsNullOrEmpty(csFilter))
                    {
                        var mc = new ModelContext
                        {
                            JSONObject = jsonObj,
                        };
                        var newResult = InvokeServerSideMethod(csFilter, new object[] { mc });
                        json = newResult.ToString();
                    }
                    else
                    {
                        json = jsonObj.ToString();
                    }
                    string initializer = addedInitializer ? null : @"
        if(typeof(model)=='undefined') model = {};";
                    string modelScript = @"
        model['" + id + "'] = " + json + @";
";
                    node.innerHTML = initializer + modelScript;
                    addedInitializer = true;
                    #endregion
                }
            }
            return doc;
            //
            //if (hasAsync)
            //{
            
            //}
            //return doc;
        }

        public static HtmlDocumentFacade ProcessServerSideScripts(this HtmlDocumentFacade doc)
        {
            var serverSideScripts = doc.getElementsByTagName("script")
                .Where(_TestForServerSide);
            var sb = new StringBuilder();
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
                if(!_TestForClientSide(node))
                {
                    node.parentNode.removeChild(node);
                }
            });
            string script = sb.ToString();
            if (script.Length > 0)
            {
                // Initialize a context
                script = sb.ToString();
                using (var engine = new V8ScriptEngine())
                {
                    var jqueryFacade = new JQueryFacade(doc);
                    engine.AddHostObject("console", new Console());
                    engine.AddHostObject("document", doc);
                    engine.AddHostObject("jQueryServerSideFacade", jqueryFacade);
                    engine.Execute("var " + modeParameter + "='server'");
                    engine.AddHostObject("model", doc.ProcessContext.Model);
                    engine.Execute(script);
                }
            }

            return doc;
        }

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
    }

    public class ModelContext
    {
        public JObject JSONObject { get; set; }
    }
    
}
