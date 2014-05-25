using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.SessionState;

namespace tspHandler
{
    public class tspModelHandler : IHttpHandler, IReadOnlySessionState
    {
        public const string id = "id";
        public const string getMethod = "gM";

        public bool IsReusable
        {
            get { return false; }
        }

        public void ProcessRequest(HttpContext context)
        {
            var req = context.Request;
            var resp = context.Response;
            string idV = req[id];
            string getMeth = req[getMethod];
            var result = tspProcessor.InvokeServerSideMethod(getMeth, null);
            string json = JsonConvert.SerializeObject(result);
            string modelScript = @"
if(!model) var model = {};
model['" + idV + "'] = " + json + @";
if(DBS) DBS.cs.onLoadModel('" + idV + "');";
            resp.ContentType = "application/javascript";
            context.Response.Write(modelScript);
        }
    }
}
