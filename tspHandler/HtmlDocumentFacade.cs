using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.IO;

namespace tspHandler
{
    public class HtmlDocumentFacade
    {
        private HtmlDocument _htmlDoc;
        public HtmlDocumentFacade(string Content)
        {
            _htmlDoc = new HtmlDocument();
            _htmlDoc.LoadHtml(Content);
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

        public HtmlNodeFacade getElementById(string id)
        {
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
    }

    public class HtmlNodeFacade
    {
        private HtmlNode _node;
        public HtmlNodeFacade(HtmlNode node)
        {
            this._node = node;
        }

        public string getAttribute(string key)
        {
            return _node.GetAttributeValue(key, "");
        }

        public string innerHTML
        {
            get
            {
                return this._node.InnerHtml;
            }
            set
            {
                this._node.InnerHtml = value;
            }
        }

        public HtmlNodeFacade parentNode
        {
            get
            {
                return new HtmlNodeFacade(this._node.ParentNode);
            }
        }

        public void removeChild(HtmlNodeFacade childNode)
        {
            this._node.RemoveChild(childNode._node);
        }

        public List<HtmlNodeFacade> getElementsByTagName(string tag)
        {
            var docNode = this._node;
            var list = new List<HtmlNodeFacade>();
            Func<HtmlNode, bool> test = node =>
            {
                return node.Name == tag;

            };
            HtmlDocumentFacade.searchForNode(test, docNode, list);
            return list;
        }
    }
}
