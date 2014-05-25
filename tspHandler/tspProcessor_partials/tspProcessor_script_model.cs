using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Web;

namespace tspHandler
{
    public static partial class tspProcessor
    {
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
                model.removeAttribute("src");

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
                        //node.appendAttribute("onload", "tsp.cs.handleAsyncModelLoad();", ";");
                    }
                    else
                    {
                        throw new NotImplementedException();
                    }
                }
                else
                {
                    #region embed JSON data in tag
                    if (modelProcessingInfo.Model == null)
                    {
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

        
    }
}
