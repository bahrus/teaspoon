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
            Action<AttributeChanges, HtmlNodeFacade, string> saveOld = (attributeChanges, targetElement, attribName) =>
            {
                if (attributeChanges != null && !attributeChanges.ContainsKey(attribName))
                {
                    string oldValue = targetElement.getAttribute(attribName);
                    attributeChanges[attribName] = new AttributeChange
                    {
                        OriginalValue = string.IsNullOrEmpty(oldValue) ? null : oldValue,
                    };

                }
            };
            Action<AttributeChanges, HtmlNodeFacade, string> saveOldClass = (attributeChanges, targetElement, className) =>
            {
                if (!targetElement.hasClass(className))
                {
                    if (!attributeChanges.ClassesToRemoveNN.Contains(className))
                    {
                        attributeChanges.ClassesToRemove.Add(className);
                    }
                }
            };
            //var clientSideChanges = new Dictionary<string, Dictionary<string, string>>(); //id => attribute name => value
            //Action<HtmlNodeFacade, string, string> setClientSideAttribValue = (el, attribName, newValue) =>
            //{
            //    if (!clientSideChanges.ContainsKey(el.id)) clientSideChanges[el.id] = new Dictionary<string, string>();
            //    var attribChanges = clientSideChanges[el.id];
            //    attribChanges[attribName] = newValue;
            //};
            foreach (var cssRule in directives)
            {
                if(cssRule.AttributeDirectives == null) continue;
                cssRule.AttributeDirectives.Sort();
                var targetElements = doc.querySelectorAll(cssRule.Rule.selectorText);
                var pc = doc.ProcessContext;
                foreach (var attributeDir in cssRule.AttributeDirectives)
                {
                    var srcElements = doc.querySelectorAll(attributeDir.Rule.selectorText);
                    foreach (var srcElement in srcElements)
                    {
                        bool serversideOnly = (_TestForServerSideOnly(srcElement));
                        //bool clientsideOnly = (_TestForClientSideOnly(srcElement));
                        var attribs = srcElement.attributes;
                        foreach (var targetElement in targetElements)
                        {
                            AttributeChanges attributeChanges = null;
                            string elId = pc.GetOrCreateID(targetElement); //need elements to have id for client side linkage among other things
                            if (serversideOnly)
                            {
                                if (!pc.AttributeChangesNN.ContainsKey(elId))
                                {
                                    attributeChanges = new AttributeChanges();
                                    pc.AttributeChanges[elId] = attributeChanges;
                                }
                                else
                                {
                                    attributeChanges = pc.AttributeChanges[elId];
                                }
                            }
                            foreach (var attrib in attribs)
                            {
                                var nm = attrib.name;
                                
                                switch (nm)
                                {
                                    case "class":
                                    case "hidden":
                                    case "data-mode":
                                        continue;
                                    case "data-class":
                                        saveOldClass(attributeChanges, targetElement, attrib.value);
                                        targetElement.addClass(attrib.value);
                                        break;
                                    case "data-hidden":
                                        saveOld(attributeChanges, targetElement, "hidden");
                                        targetElement.setAttribute("hidden", attrib.value);
                                        break;
                                    case "data-data-mode":
                                        saveOld(attributeChanges, targetElement, "data-mode");
                                        targetElement.setAttribute("data-mode", attrib.value);
                                        break;
                                    default:
                                        saveOld(attributeChanges, targetElement, nm);
                                        targetElement.setAttribute(nm, attrib.value);
                                        break;
                                }
                                

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

        public static HtmlDocumentFacade RemoveServerSideOnlyCSSAttributes(this HtmlDocumentFacade doc)
        {
            if (doc.ProcessContext.AttributeChanges != null)
            {
                foreach (var kvp in doc.ProcessContext.AttributeChanges)
                {
                    string elID = kvp.Key;
                    var targetEl = doc.getElementById(elID);
                    var attribChanges = kvp.Value;
                    foreach (var attribChangeKVP in attribChanges)
                    {
                        string attribName = attribChangeKVP.Key;
                        var attribChange = attribChangeKVP.Value;
                        if (attribChange.OriginalValue == null)
                        {
                            targetEl.removeAttribute(attribName);
                        }
                        else
                        {
                            targetEl.setAttribute(attribName, attribChange.OriginalValue);
                        }
                    }
                    if (attribChanges.ClassesToRemove != null)
                    {
                        foreach (var classToRemove in attribChanges.ClassesToRemove)
                        {
                            targetEl.removeClass(classToRemove);
                        }
                    }
                }
            }
            return doc;
        }
    
        
    }
}
