using CurlyBraceParser;
using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using ClassGenMacros;
using Fizzler.Systems.HtmlAgilityPack;

namespace tspHandler
{
    public class HtmlDocumentFacade
    {
        private HtmlDocument _htmlDoc;
        private IDocumentHost _host;

        /// <summary>
        /// Deprecate
        /// </summary>
        /// <param name="Content"></param>
        public HtmlDocumentFacade(string Content)
        {
            _htmlDoc = new HtmlDocument();
            _htmlDoc.LoadHtml(Content);
        }

        public HtmlDocumentFacade(IDocumentHost host)
        {
            _htmlDoc = new HtmlDocument();
            _host = host;
            _htmlDoc.LoadHtml(host.GetContentOfDocument());
        }

        public string GetHostContent(string src)
        {
            return _host.GetContentOfRelativeResource(src);
        }

        public List<HtmlNodeFacade> getElementsByTagName(string tag)
        {
            var docNode = this._htmlDoc.DocumentNode;
            var list = new List<HtmlNodeFacade>();
            Func<HtmlNode, bool> test = node =>
            {
                return node.Name == tag;
                
            };
            searchForNode(test, docNode, list);
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
            searchForNode(test, docNode, list);
            return list;
        }

        public HtmlNodeFacade getElementById(string id)
        {
            if (id == null) return null;
            var node = this._htmlDoc.GetElementbyId(id);
            if (node == null) return null;
            return new HtmlNodeFacade(node);
        }

        public static void searchForNode(Func<HtmlNode, bool> test, HtmlNode node, List<HtmlNodeFacade> nodes)
        {
            if (test(node))
            {
                nodes.Add( new HtmlNodeFacade(node) );
            }
            foreach (var child in node.ChildNodes)
            {
                searchForNode(test, child, nodes);
            }
        }

        public string Content
        {
            get
            {
                var sw = new StringWriter();
                this._htmlDoc.Save(sw);
                return sw.ToString();
            }
        }

        

        public HtmlNodeFacade createElement(string tag)
        {
            return new HtmlNodeFacade( _htmlDoc.CreateElement(tag));
        }

        public HtmlNodeFacade createTextNode(string text)
        {
            return new HtmlNodeFacade(_htmlDoc.CreateTextNode(text));
        }

        public List<HtmlNodeFacade> querySelectorAll(string selectorText)
        {
            var returnObj = _htmlDoc.DocumentNode
                .QuerySelectorAll(selectorText)
                .Select(node => new HtmlNodeFacade(node))
                .ToList();
            return returnObj;
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
                    .Select(cssContent => this.processCssContent(cssContent))
                    .ToList();
                    #endregion
                    #region get css from actual document
                    var inlineStyles = this.getElementsByTagName("style")
                        .Select(node => node.innerHTML).ToArray();
                    styleSheets.Add(this.processCssContent(String.Join("\n\r", inlineStyles)));
                    #endregion
                    this._styleSheets = styleSheets.ToArray();

                }
                return this._styleSheets;
            }
        }

        private StyleSheet processCssContent(string cssContent)
        {
            var lines = CurlyBraceParser.Parser.Parse(cssContent);
            var list = new List<CssRule>();
            var rules = lines.Where(line =>
            {
                var openStatement = line as OpenBraceStatement;
                return openStatement != null;
            })
            .Select(line => line as OpenBraceStatement)
            .Select(obs => {
                string selectorText =  obs.FrontTrimmedLiveStatement.SubstringBeforeLast("{").Trim();
                return new CssRule
                {
                    selectorText = selectorText,
                    style = this.processStyle(obs.Children),
                };
            });
            return new StyleSheet
            {
                rules = rules.ToArray(),
            };
        }

        private Dictionary<string, string> processStyle(List<ILine> Children)
        {
            var returnObj = new Dictionary<string, string>();
            Children.ForEach(child =>
            {
                var liveStatement = child as LiveStatement;
                if (liveStatement == null) return;
                string str = liveStatement.FrontTrimmedLiveStatement;
                if (!str.Contains(":")) return;
                var keyValue = str.SplitFirst(":");
                string key = keyValue[0].Trim();
                string val = keyValue[1].SubstringBeforeLast(";").Trim();
                returnObj[key] = val;
            });
            return returnObj;
        }
    }

    
}
