using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace TestWebAppClassic.ModelTests
{
    public partial class CreateHttpContextTestData : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            var newCookie = new HttpCookie("IAmHere");
            newCookie.Value = "Coming from CreateHttpContextTestData";
            newCookie.Expires = DateTime.Now.AddDays(1);
            Page.Session.Add("testSession", new ModelTest1
            {
                StringValue = "Hello, world",
            });
            Page.Response.Cookies.Add(newCookie);
            Page.Response.Redirect("HttpContext.tsp.html");
        }
    }
}