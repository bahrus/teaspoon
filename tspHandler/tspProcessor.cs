using Newtonsoft.Json;
using System;
using System.Linq;
using ClassGenMacros;
using System.Text;
using Noesis.Javascript;

namespace tspHandler
{

    public static class tspProcessor
    {

        public const string ModelAttribute = "data-model";
        public const string ServerSideProcessor = "tsp-ssx";
        public const string Mode = "data-mode";
        public const string ServerSideMode = "server-side-only";
        public const string ClientSideMode = "client-side-only";
        public const string AllMode = "all";
        

        private static object InvokeServerSideMethod(string StaticMethodString, object[] args)
        {
            var typeString = StaticMethodString.SubstringBeforeLast(".");
            var methodString = StaticMethodString.SubstringAfterLast(".");
            var typ = Type.GetType(typeString, true);
            var result = typ.GetMethod(methodString).Invoke(null, args);
            return result;
        }

        public static HtmlDocumentFacade ProcessServerSideScripts(this HtmlDocumentFacade doc)
        {
            var serverSideScripts = doc.getElementsByTagName("script").Where(node =>
            {
                string mode = node.getAttribute(Mode);
                if (string.IsNullOrEmpty(mode)) return false;
                return (mode == ServerSideMode || mode == AllMode);

            });
            var model = serverSideScripts.FirstOrDefault(node => !string.IsNullOrEmpty(node.getAttribute(ModelAttribute)));
            if (model != null)
            {
                var staticMethodString = model.getAttribute(ModelAttribute);
                var result = InvokeServerSideMethod(staticMethodString, null);
                string json = JsonConvert.SerializeObject(result);
                model.innerHTML = "var model = " + json;
                
            }
            serverSideScripts = serverSideScripts.Where(node => string.IsNullOrEmpty(node.getAttribute(ModelAttribute)));
            var sb = new StringBuilder();
            serverSideScripts.ToList().ForEach(node =>
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
                    context.SetParameter("model", model);
                    context.SetParameter("mode", "server");
                    // Running the script
                    context.Run(script);
                }
            }

            return doc;
        }

        public static HtmlDocumentFacade RetrieveContext(this HtmlDocumentFacade doc)
        {
            //TODO:  Implement
            return doc;
        }

        public static HtmlDocumentFacade PerformServerSideProcessing(this HtmlDocumentFacade doc)
        {
            var relevantStyles = doc.styleSheets
                .SelectMany(ss => ss.rules)
                .Where(rule => rule.style.ContainsKey(ServerSideProcessor));
            relevantStyles.ToList().ForEach(rule =>
            {
                string staticMethodString = rule.style[ServerSideProcessor];
                InvokeServerSideMethod(staticMethodString, new object[] { rule, doc });
            });
            return doc;
        }
    }
}
