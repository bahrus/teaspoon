using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Web;

namespace tsp
{
    public class Http
    {
        public static ContextFacade GetContextFacade()
        {
            return new ContextFacade();
            
            //TODO:  Request Headers, Session, Cookies
        }
    }

    public class ContextFacade
    {

        private RequestFacade _reqFacade;

        public ContextFacade()
        {
            _reqFacade = new RequestFacade(HttpContext.Current.Request);
        }

        public RequestFacade Request
        {
            get
            {
                return _reqFacade;
            }
        }
        
    }

    public class RequestFacade
    {
        private HttpRequest _req;

        public RequestFacade(HttpRequest req)
        {
            _req = req;
        }

        public Dictionary<string, string> QueryStringParams
        {
            get {
                var p = _req.QueryString;
                return p.AllKeys.ToDictionary(k => k, k => p[k]);
                
            }
        }

        public Dictionary<string, string> PostParams
        {
            get
            {
                var p = _req.Form;
                return p.AllKeys.ToDictionary(k => k, k => p[k]);
            }
        }

        public Dictionary<string, CookieFacade> Cookies
        {
            get
            {
                var c = _req.Cookies;
                return c.AllKeys.ToDictionary(k => k, k => new CookieFacade(c[k]));
            }
        }

        public Dictionary<string, string> Headers
        {
            get
            {
                var h = _req.Headers;
                return h.AllKeys.ToDictionary(k => k, k => h[k]);
            }
        }
    }

    public class CookieFacade 
    {
        private HttpCookie _cookie;
        public CookieFacade(HttpCookie cookie)
        {
            _cookie = cookie;
        }

        public string Name
        {
            get
            {
                return _cookie.Name;
            }
            set
            {
                _cookie.Name = value;
            }
        }

        public string Path
        {
            get
            {
                return _cookie.Path;
            }
            set
            {
                _cookie.Path = value;
            }
        }

        public bool Secure
        {
            get
            {
                return _cookie.Secure;
            }
            set
            {
                _cookie.Secure = value;
            }
        }

        public bool HttpOnly
        {
            get
            {
                return _cookie.HttpOnly;
            }
            set
            {
                _cookie.HttpOnly = value;
            }
        }

        public string Domain
        {
            get
            {
                return _cookie.Domain;
            }
            set
            {
                _cookie.Domain = value;
            }
        }

        public DateTime Expires
        {
            get
            {
                return _cookie.Expires;
            }
            set
            {
                _cookie.Expires = value;
            }
        }

        public string Value
        {
            get
            {
                return _cookie.Value;
            }
            set
            {
                _cookie.Value = value;
            }
        }

        public Dictionary<string, string> Values
        {
            get {
                var p = _cookie.Values;
                return p.AllKeys
                    .Where(k => k != null)
                    .ToDictionary(k => k, k => p[k]);
            }
            
        }

        public string this[string name]
        {
            get
            {
                return _cookie[name];
            }
            set
            {
                _cookie[name] = value;
            }
        }

    }

}
