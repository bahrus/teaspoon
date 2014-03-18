using CurlyBraceParser;
using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using ClassGenMacros;
using Fizzler.Systems.HtmlAgilityPack;
using System.Web;

namespace tspHandler
{
    public class HtmlDocumentFacade : INodeSelector
    {

        public ProcessingContext ProcessContext { get; set; }

        private HtmlDocument _htmlDoc;

        public IDocumentHost Host
        {
            get
            {
                return _host;
            }
        }
        private IDocumentHost _host;

        public Dictionary<string, HtmlNodeFacade> DynamicallyChangedIDLookup { get; set; }
        public Dictionary<string, HtmlNodeFacade> DynamicallyChangedIDLookupNN
        {
            get{
                if (DynamicallyChangedIDLookup == null) DynamicallyChangedIDLookup = new Dictionary<string, HtmlNodeFacade>();
                return DynamicallyChangedIDLookup;
            }
        }

        /// <summary>
        /// Deprecate
        /// </summary>
        /// <param name="Content"></param>
        public HtmlDocumentFacade(string Content)
        {
            _htmlDoc = new HtmlDocument();
            _htmlDoc.LoadHtml(Content);
            this.ProcessContext = new ProcessingContext();
        }

        public HtmlDocumentFacade(IDocumentHost host)
        {
            _host = host;
            this.Trace("createHTMLDocument");
            _htmlDoc = new HtmlDocument();
            HtmlNode.ElementsFlags.Remove("option");
            HtmlNode.ElementsFlags.Remove("form");
            string content = host.GetContentOfDocument();
            _htmlDoc.LoadHtml(content);
            this.Trace("endCreateHTMLDocument");
            this.ProcessContext = new ProcessingContext();

        }

        

        

        public string GetHostContent(string src)
        {
            return _host.GetContentOfRelativeResource(src);
        }

        public string GetHostContentFilePath(string src)
        {
            return _host.GetFilePathOfRelativeResource(src);
        }

        public string GetHostRelativePath(string filePath)
        {
            return _host.GetRelativePathOfFilePath(filePath);
        }

        public List<HtmlNodeFacade> getElementsByTagName(string tag)
        {
            var docNode = this._htmlDoc.DocumentNode;
            var list = new List<HtmlNodeFacade>();
            Func<HtmlNode, bool> test = node =>
            {
                return node.Name == tag;
                
            };
            searchForNode(test, docNode, list, this);
            return list;
        }

        public List<HtmlNodeFacade> getElementsByClassName(string className)
        {
            var docNode = this._htmlDoc.DocumentNode;
            var list = new List<HtmlNodeFacade>();
            Func<HtmlNode, bool> test = node =>
            {
                string classTest = node.GetAttributeValue("class", string.Empty);
                string[] classes = classTest.Split(' ');
                return classes.Contains(className);
            };
            searchForNode(test, docNode, list, this);
            return list;
        }

        public HtmlNodeFacade getElementById(string id)
        {
            if (id == null) return null;
            if (this.DynamicallyChangedIDLookup != null && this.DynamicallyChangedIDLookup.ContainsKey(id))
            {
                return this.DynamicallyChangedIDLookup[id];
            }
            var node = this._htmlDoc.GetElementbyId(id);
            if (node == null) return null;
            return new HtmlNodeFacade(node, this);
        }

        public static void searchForNode(Func<HtmlNode, bool> test, HtmlNode node, List<HtmlNodeFacade> nodes, HtmlDocumentFacade owner)
        {
            if (test(node))
            {
                nodes.Add( new HtmlNodeFacade(node, owner) );
            }
            foreach (var child in node.ChildNodes)
            {
                searchForNode(test, child, nodes, owner);
            }
        }

        public string Content
        {
            get
            {
                
                if (string.IsNullOrEmpty(this.IDSelector))
                {
                    var sw = new StringWriter();
                    this._htmlDoc.Save(sw);
                    return sw.ToString();
                }
                else
                {
                    var el = this._htmlDoc.GetElementbyId(this.IDSelector);
                    return el.OuterHtml;
                }
                
            }
        }

        public string IDSelector { get; set; }

        public HtmlNodeFacade body
        {
            get
            {
                return this.getElementsByTagName("body")[0];
            }
        }

        public HtmlNodeFacade head
        {
            get
            {
                return this.getElementsByTagName("head")[0];
            }
        }

        public HtmlNodeFacade html
        {
            get
            {
                return this.getElementsByTagName("html")[0];
            }
        }

        public HtmlNodeFacade documentElement
        {
            get
            {
                return new HtmlNodeFacade( _htmlDoc.DocumentNode, this);
            }
        }

        public HtmlNodeFacade createElement(string tag)
        {
            return new HtmlNodeFacade( _htmlDoc.CreateElement(tag), this);
        }

        public HtmlNodeFacade createTextNode(string text)
        {
            return new HtmlNodeFacade(_htmlDoc.CreateTextNode(text), this);
        }

        public JSArrayFacade<HtmlNodeFacade> querySelectorAll(string selectorText)
        {
            var nodes =  _htmlDoc.DocumentNode
                .QuerySelectorAll(selectorText)
                .Select(node => new HtmlNodeFacade(node, this))
            ;
            return JSArrayFacade<HtmlNodeFacade>.FromArray(nodes.ToArray());
        }

        private StyleSheet[] _styleSheets;

        public StyleSheet[] styleSheets
        {
            get
            {
                if (this._styleSheets == null)
                {
                    #region get external style sheets
                    var styleSheets = this.getElementsByTagName("link").Where(node =>
                    {
                        if (node.getAttribute("href") == null) return false;
                        string typ = node.getAttribute("type");
                        if (typ == null) return false;
                        typ = typ.ToLower().Trim();
                        return typ == "css/text";
                    })
                    .Select(node => node.getAttribute("href"))
                    .Select(href => this._host.GetContentOfRelativeResource(href))
                    .Select(cssContent => processCssContent(cssContent))
                    .ToList();
                    #endregion
                    #region get css from actual document
                    var inlineStyles = this.getElementsByTagName("style")
                        .Select(node => node.innerHTML).ToArray();
                    styleSheets.Add(processCssContent(String.Join("\n\r", inlineStyles)));
                    #endregion
                    this._styleSheets = styleSheets.ToArray();

                }
                return this._styleSheets;
            }
        }

        public static StyleSheet processCssContent(string cssContent)
        {
            var lines = CurlyBraceParser.Parser.Parse(cssContent);
            var list = new List<CssRule>();
            var openBraceRules = lines.Where(line =>
            {
                var openStatement = line as OpenBraceStatement;
                if(openStatement != null) return true;
                var liveStatement = line as LiveStatement;
                if (liveStatement == null) return false;
                string frontTrimmed = liveStatement.FrontTrimmedLiveStatement.TrimEnd();
                return frontTrimmed.Contains("{") && frontTrimmed.EndsWith("}");
            })
            .Select(line => {
                var obs = line as OpenBraceStatement;
                if(obs !=null){
                    string selectorText =  obs.FrontTrimmedLiveStatement.SubstringBeforeLast("{").Trim();
                    return new CssRule
                    {
                        selectorText = selectorText,
                        style = processStyle(obs.Children),
                    };
                }
                else
                {
                    var liveStatement = line as LiveStatement;
                    string frontTrimmed = liveStatement.FrontTrimmedLiveStatement.TrimEnd();
                    string selectorText = frontTrimmed.SubstringBefore("{").Trim();
                    string rulesText = frontTrimmed.SubstringAfter("{").SubstringBeforeLast("}");
                    var ruleTokens = new Dictionary<string, string>();
                    processLine(rulesText, ruleTokens);
                    return new CssRule
                    {
                        selectorText = selectorText,
                        style = ruleTokens,
                    };
                }
            });
            
            return new StyleSheet
            {
                rules = openBraceRules.ToArray(),
            };
        }

        public static ScriptTag processJSTag(string content)
        {
            var lines = CurlyBraceParser.Parser.Parse(content);
            var openBraceFns = lines.Where(line =>
            {
                var openStatement = line as OpenBraceStatement;
                return openStatement != null && openStatement.FrontTrimmedLiveStatement.StartsWith("function ");
            })
            .Select(line =>
            {
                var openStatement = line as OpenBraceStatement;
                string functionSignature = openStatement.FrontTrimmedLiveStatement.SubstringBefore("{").Trim().SubstringAfter("function ");
                string functionName = functionSignature.SubstringBefore("(").Trim();
                string parameterNames = functionSignature.SubstringBetween("(").And(")");
                string[] paramNamesArr = parameterNames.RemoveWhitespace().Split(',');
                return new JSFunction
                {
                    Name = functionName,
                    Params = paramNamesArr,
                };
            })
            ;
            return new ScriptTag
            {
                Functions = openBraceFns.ToArray(),
            };
        }

        private static Dictionary<string, string> processStyle(List<ILine> Children)
        {
            if (Children == null) return null;
            var returnObj = new Dictionary<string, string>();
            
            Children.ForEach(child =>
            {
                var liveStatement = child as LiveStatement;
                if (liveStatement == null) return;
                string str = liveStatement.FrontTrimmedLiveStatement;
                processLine(str, returnObj);
            });
            return returnObj;
        }

        private static void processLine(string str, Dictionary<string, string> returnObj)
        {
            if (!str.Contains(":")) return;
            var keyValue = str.SplitFirst(":");
            string key = keyValue[0].Trim();
            string val = keyValue[1].SubstringBeforeLast(";").Trim();
            returnObj[key] = val;
        }
    }

    
}
