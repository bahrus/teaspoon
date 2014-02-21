using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ClassGenMacros;

namespace tspHandler
{
    public static partial class tspProcessor
    {
        public static HtmlDocumentFacade ProcessStyleDirectives(this HtmlDocumentFacade doc)
        {
            int docOrder = 0;
            var directives = new List<StyleDirective>();
            var attributeLinkStyles = doc.querySelectorAll("style[" + AttributeLinkAttribute + "]");
            attributeLinkStyles.ForEach(attribeLinkStyleNode =>
            {
                #region process all attribute style nodes
                string attributeLink = Fun.Val(() => {
                    string overrideAttributeLink = attribeLinkStyleNode.getAttribute(AttributeLinkAttribute);
                    if (string.IsNullOrEmpty(overrideAttributeLink)) return "Attributes";
                    return overrideAttributeLink;
                });
                var attributeClasses = new List<StyleDirective>();
                string content = attribeLinkStyleNode.innerHTML.Trim();
                var styleSheet = HtmlDocumentFacade.processCssContent(content);
                var rules = styleSheet.rules.ToList();
                rules.ForEach(rule =>
                {
                    var styleDirective = new StyleDirective
                    {
                        Rule = rule,
                        DocOrder = docOrder++,
                        Node = attribeLinkStyleNode,
                    };
                    if (rule.selectorText.Contains(attributeLink))
                    {
                        attributeClasses.Add(styleDirective);
                    }
                    else
                    {
                        directives.Add(styleDirective);
                        if (attributeClasses.Count > 0)
                        {
                            styleDirective.AttributeDirectives = attributeClasses;
                            attributeClasses = new List<StyleDirective>();
                        }
                    }
                });
                #endregion
            });
            directives.Sort();
            foreach (var cssRule in directives)
            {
                if(cssRule.AttributeDirectives == null) continue;
                cssRule.AttributeDirectives.Sort();
                var targetElements = doc.querySelectorAll(cssRule.Rule.selectorText);

                foreach (var attributeDir in cssRule.AttributeDirectives)
                {
                    var srcElements = doc.querySelectorAll(attributeDir.Rule.selectorText);
                    foreach (var srcElement in srcElements)
                    {
                        if (!_TestForServerSide(srcElement)) continue;
                        var attribs = srcElement.attributes;
                        foreach (var targetElement in targetElements)
                        {
                            foreach (var attrib in attribs)
                            {
                                var nm = attrib.name;
                                switch (nm)
                                {
                                    case "class":
                                    case "hidden":
                                    case "data-mode":
                                        continue;
                                }
                                targetElement.setAttribute(attrib.name, attrib.value);

                            }
                        }
                    
                    }
                }
            }
            return doc;
            
            //styleDirectiveRules.Sort();
            //var styleDirectiveContext = new StyleDirectiveContext();
            //foreach (var directive in styleDirectiveRules)
            //{
            //    #region Process Directives
            //    string serversideMethodString = directive.Compiler;
            //    if (serversideMethodString == DBS_Attr)
            //    {
            //        //ProcessDBSAttr(directive, styleDirectiveContext);

            //    }
            //    else
            //    {
                    
            //    }
            //    #endregion
            //}
            //foreach (var actionKVP in styleDirectiveContext.ElementActions)
            //{
            //    actionKVP.Value(actionKVP.Key);
            //}
            //return doc;
        }

        //private static void ProcessDBSAttr(StyleDirective directive, StyleDirectiveContext context)
        //{

        //    foreach (var styleProperty in directive.Rule.style)
        //    {
        //        var key = styleProperty.Key;
        //        var val = styleProperty.Value;
        //        if (key.Contains("@"))
        //        {
        //            string attributeName = key.SubstringBefore("@");
        //            string subPropertyName = key.SubstringAfter("@");
        //            var els = directive.Node.ownerDocument.querySelectorAll(directive.Rule.selectorText);
        //            foreach (var el in els)
        //            {
        //                string originalAttribute = el.getAttribute(attributeName);
        //                if (!string.IsNullOrEmpty(originalAttribute))
        //                {
        //                    if (!val.EndsWith("!important"))
        //                    {
        //                        continue;
        //                    }
        //                }
        //                if (string.IsNullOrEmpty(subPropertyName))
        //                {
        //                    context.ElementActions[el] = (nd => nd.setAttribute(attributeName, val));
        //                }
        //                else
        //                {
        //                    throw new NotImplementedException();
        //                }
        //            }
        //        }
        //        else
        //        {
        //            throw new NotImplementedException();
        //        }

        //    }
        //}
    
        
    }
}
