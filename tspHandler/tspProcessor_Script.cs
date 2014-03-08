using Microsoft.ClearScript.V8;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace tspHandler
{
    public static partial class tspProcessor
    {
        public static HtmlDocumentFacade ProcessServerSideScripts(this HtmlDocumentFacade doc)
        {
            var scripts = doc.getElementsByTagName("script");
            var noSideScripts = scripts
                .Where(_TestForNoSide);
            var noSideScriptsList = noSideScripts.ToList();
            noSideScriptsList.ForEach(node =>
            {
                node.parentNode.removeChild(node);
            });
            var serverSideScripts = scripts
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
                if (!_TestForClientSide(node))
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
    }
}
