using HtmlAgilityPack;
using System;
using System.Collections.Generic;

namespace tspHandler
{
    public class HtmlNodeFacade
    {
        private HtmlNode _node;

        public string className
        {
            get
            {
                return this.getAttribute("class");
            }
            set
            {
                this.setAttribute("class", value);
            }
        }

        public string id
        {
            get
            {
                return _node.GetAttributeValue("id", string.Empty);
            }
            set
            {
                _node.SetAttributeValue("id", value);
            }
        }

        public HtmlNodeFacade(HtmlNode node)
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

        public HtmlNodeFacade appendChild(HtmlNodeFacade child)
        {
            var parent = child.parentNode;
            var returnObj = this._node.AppendChild(child._node);
            if (parent != null)
            {
                parent.removeChild(child);
            }
            return new HtmlNodeFacade(returnObj);
        }

        public HtmlNodeFacade insertBefore(HtmlNodeFacade newChild, HtmlNodeFacade refChild)
        {
            return new HtmlNodeFacade( this._node.InsertBefore(newChild._node, refChild._node));
        }

    }
}
