using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using Fizzler.Systems.HtmlAgilityPack;
using System.Linq;

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

        public string this[string index]
        {
            get
            {
                return this.getAttribute(index);
            }
            set
            {
                this.setAttribute(index, value);
            }
        }

        public void delete()
        {
            _node.ParentNode.RemoveChild(_node);
        }

        public string tagName
        {
            get { 
                return _node.Name; 
            }
            set { _node.Name = value; }
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

        public string name
        {
            get { return this.getAttribute("name"); }
            set { this.setAttribute("name", value); }
        }

        public string value
        {
            get { return this.getAttribute("value"); }
            set { this.setAttribute("value", value); }
        }

        public string type
        {
            get { return this.getAttribute("type"); }
            set { this.setAttribute("type", value); }
        }

        public HtmlNodeFacade(HtmlNode node)
        {
            if (node == null) throw new Exception();
            this._node = node;
        }

        public List<HtmlNodeFacade> querySelectorAll(string selectorText)
        {
            if (selectorText.Contains(">"))
            {
                throw new Exception("querySelectorAll implementation does not currently support the > operator");
            }
            var returnObj = _node
                .QuerySelectorAll(selectorText)
                .Select(node => new HtmlNodeFacade(node))
                .ToList();
            return returnObj;
        }

        public string getAttribute(string key)
        {
            return _node.GetAttributeValue(key, "");
        }

        public bool hasAttribute(string key)
        {
            return _node.Attributes.Contains(key);
            //return !string.IsNullOrEmpty(_node.GetAttributeValue(key, ""));
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
                if (value == null)
                {
                    this._node.InnerHtml = "null";
                    return;
                }
                this._node.InnerHtml = value;
            }
        }

        public HtmlNodeFacade parentNode
        {
            get
            {
                if (this._node.ParentNode == null) return null;
                return new HtmlNodeFacade(this._node.ParentNode);
            }
        }

        public List<HtmlNodeFacade> ChildNodes
        {
            get
            {
                var returnObj = new List<HtmlNodeFacade>();
                foreach (var child in _node.ChildNodes)
                {
                    returnObj.Add(new HtmlNodeFacade(child));
                }
                return returnObj;
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

        public HtmlNodeFacade insertAfter(HtmlNodeFacade newChild, HtmlNodeFacade refChild)
        {
            return new HtmlNodeFacade(this._node.InsertAfter(newChild._node, refChild._node));
        }

        public void removeAttribute(string attrName)
        {
            _node.Attributes.Remove(attrName);
        }

        public void DoForThisAndAllAncestors(Action<HtmlNodeFacade> action)
        {
            action(this);
            foreach (var child in this.ChildNodes)
            {
                child.DoForThisAndAllAncestors(action);
            }
        }

    }
}
