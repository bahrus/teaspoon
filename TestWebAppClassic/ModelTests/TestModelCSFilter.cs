using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using tspHandler;

namespace TestWebAppClassic.ModelTests
{
    public class TestModelCSFilter
    {
        public static JObject FilterOutSession(ModelContext context)
        {
            context.JSONObject.Remove("Session");
            return context.JSONObject;
        }
    }
}