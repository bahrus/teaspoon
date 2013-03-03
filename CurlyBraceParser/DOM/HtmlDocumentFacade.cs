using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.IO;

namespace CurlyBraceParser.DOM
{
    public class HtmlDocumentFacade
    {
        private HtmlDocument _htmlDoc;
        public HtmlDocumentFacade(string Content)
        {
            _htmlDoc = new HtmlDocument();
            _htmlDoc.LoadHtml(Content);
        }

        public List<HTMLElement> getElementsByTagName(string tag)
        {
            var docNode = this._htmlDoc.DocumentNode;
            var list = new List<HTMLElement>();
            Func<HtmlNode, bool> test = node =>
            {
                return node.Name == tag;

            };
            searchForNode(test, docNode, list);
            return list;
        }

        public HTMLElement getElementById(string id)
        {
            if (id == null) return null;
            var node = this._htmlDoc.GetElementbyId(id);
            if (node == null) return null;
            return new HTMLElement(node);
        }

        public static void searchForNode(Func<HtmlNode, bool> test, HtmlNode node, List<HTMLElement> nodes)
        {
            if (test(node))
            {
                nodes.Add(new HTMLElement(node));
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

        public HTMLElement createElement(string tag)
        {
            return new HTMLElement(_htmlDoc.CreateElement(tag));
        }

        public HTMLElement createTextNode(string text)
        {
            return new HTMLElement(_htmlDoc.CreateTextNode(text));
        }
    }

    public class HTMLElement
    {
        private HtmlNode _node;
        public HTMLElement(HtmlNode node)
        {
            this._node = node;
        }

        public string getAttribute(string key)
        {
            return _node.GetAttributeValue(key, "");
        }

        public void setAttribute(string key, string val)
        {
            _node.SetAttributeValue(key, val);
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

        public HTMLElement parentNode
        {
            get
            {
                return new HTMLElement(this._node.ParentNode);
            }
        }

        public void removeChild(HTMLElement childNode)
        {
            this._node.RemoveChild(childNode._node);
        }

        public List<HTMLElement> getElementsByTagName(string tag)
        {
            var docNode = this._node;
            var list = new List<HTMLElement>();
            Func<HtmlNode, bool> test = node =>
            {
                return node.Name == tag;

            };
            HtmlDocumentFacade.searchForNode(test, docNode, list);
            return list;
        }

        public void appendChild(HTMLElement child)
        {
            this._node.AppendChild(child._node);
        }

    }

    public class Event
    {
    }
}
