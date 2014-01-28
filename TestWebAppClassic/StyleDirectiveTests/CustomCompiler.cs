using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using tspHandler;

namespace TestWebAppClassic.StyleDirectiveTests
{
    public class CustomCompiler
    {
        public static List<HtmlNodeFacade> Echo(StyleSheet ss, HtmlNodeFacade node)
        {
            var newNode = node.ownerDocument.createElement("div");
            newNode.innerHTML = "you are there";
            node.innerHTML = "i am here";
            var returnObj = new List<HtmlNodeFacade>
            {
                node, 
                newNode,
            };
            return returnObj;
        }

        
    }
}