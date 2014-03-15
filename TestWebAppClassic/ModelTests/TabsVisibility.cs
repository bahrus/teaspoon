using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TestWebAppClassic.ModelTests
{
    public class TabsVisibility
    {
        public List<string> NonVisibibleTabIDs { get; set; }

        public TabsVisibility()
        {
            this.NonVisibibleTabIDs = new List<string>
            {
                "tab1"
            };
        }

        public bool checkRemove(string classOrId)
        {
            return this.NonVisibibleTabIDs.Contains(classOrId);
        }

        public static TabsVisibility GetTabsVisibility()
        {
            return new TabsVisibility();
        }
    }

    
    
}