using System.Web;
using ClassGenMacros;

namespace tspHandler
{
    public class Navigator
    {
        public string userAgent
        {
            get
            {
                return HttpContext.Current.Request.UserAgent;
            }
        }

        public string appVersion
        {
            get
            {
                return this.userAgent.SubstringAfter("/");
            }
        }
    }
}
