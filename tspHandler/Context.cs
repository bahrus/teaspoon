using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace tsp
{
    public class Http
    {
        public static Context GetContext()
        {
            return new Context
            {
                Request = new Request
                {
                    Params = Request.GetRequestParams(),
                }
            };
            //TODO:  Request Headers, Session, Cookies
        }
    }

    public class Context
    {
        public Context()
        {
        }

        public Request Request { get; set; }
        
    }

    public class Request
    {
        public Dictionary<string, string> Params { get; set; }

        public static Dictionary<string, string> GetRequestParams()
        {
            var returnObj = new Dictionary<string, string>();
            var req = HttpContext.Current.Request;
            foreach (string par in HttpContext.Current.Request.QueryString)
            {
                returnObj[par] = req[par];
            }
            return returnObj;
        }
    }

    

}
