using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using Fizzler.Systems.HtmlAgilityPack;
using System.Linq;

namespace tspHandler
{
    public class HtmlNodeFacade : INodeSelector
    {
        private HtmlNode _node;
        private HtmlDocumentFacade _ownerDoc;

        public void addClass(string className)
        {
            if (string.IsNullOrEmpty(className)) return;
            string[] classNames = className.Split(' ');
            string currClassName = this.className;
            if (string.IsNullOrEmpty(currClassName))
            {
                this.className = className;
            }
            else
            {
                var currClassNames = currClassName.Split(' ').ToList();
                foreach (string newClassName in classNames)
                {
                    if (!currClassNames.Contains(newClassName))
                    {
                        currClassNames.Add(newClassName);
                    }
                }
                this.className = string.Join(" ", currClassNames.ToArray());
            }

 
        }

        public void removeClass(string className)
        {
            if (string.IsNullOrEmpty(className)) return;
            string[] classNames = className.Split(' ');
            string currClassName = this.className;
            
            var currClassNames = currClassName.Split(' ').ToList();
            foreach (string defunctClassName in classNames)
            {
                if (!currClassNames.Contains(defunctClassName))
                {
                    currClassNames.Remove(defunctClassName);
                }
            }
            this.className = string.Join(" ", currClassNames.ToArray());

        }

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

        public JSArrayFacade<string> classList
        {
            get
            {
                string cn = this.className;
                string[] classes = cn.Split(' ');
                return JSArrayFacade<string>.FromArray(classes);
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
                if (_node.Name.StartsWith("#")) return _node.Name;
                return _node.Name.ToUpper(); 
            }
            set { _node.Name = value.ToUpper(); }
        }

        public string id
        {
            get
            {
                return _node.GetAttributeValue("id", string.Empty);
                //return _node.Id;
            }
            set
            {
                _node.SetAttributeValue("id", value);
                this.ownerDocument.DynamicallyChangedIDLookupNN[value] = this;
                //_node.Id = value;
            }
        }

        public string name
        {
            get { return this.getAttribute("name"); }
            set { this.setAttribute("name", value); }
        }

        public HtmlDocumentFacade ownerDocument
        {
            get
            {
                return _ownerDoc;
            }
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

        public HtmlNodeFacade(HtmlNode node, HtmlDocumentFacade owner)
        {
            if (node == null) throw new Exception();
            this._node = node;
            this._ownerDoc = owner;
        }

        public void insertAdjacentHTML(string placement, string content){
            var span = _node.OwnerDocument.CreateElement("span");
            span.InnerHtml = content;
            switch (placement.ToLower())
            {
                case "beforebegin":
                    _node.ParentNode.InsertBefore(span.FirstChild, _node);
                    break;
                case "afterend":
                    _node.ParentNode.InsertAfter(span.FirstChild, _node);
                    break;
                default:
                    throw new NotImplementedException();

            }
            
        }

        public HtmlNodeFacade previousSibling
        {
            get
            {
                return new HtmlNodeFacade( _node.PreviousSibling, _ownerDoc);
            }
        }

        public JSArrayFacade<HtmlNodeFacade> querySelectorAll(string selectorText)
        {
            //if (selectorText.Contains(">"))
            //{
            //    throw new Exception("querySelectorAll implementation does not currently support the > operator");
            //}
            var nodes = _node
                .QuerySelectorAll(selectorText)
                .Select(node => new HtmlNodeFacade(node, this._ownerDoc));
            return JSArrayFacade<HtmlNodeFacade>.FromArray(nodes.ToArray());
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

        public bool hasClass(string className)
        {
            if (string.IsNullOrEmpty(className)) return false;
            var classNames = className.Split(' ').ToList();
            return classNames.Contains(className);
        }

        public void setAttribute(string key, string val)
        {
            _node.SetAttributeValue(key, val);
        }

        public void appendAttribute(string key, string val, string delimiter)
        {
            var currAttr = this.getAttribute(key);
            if(!string.IsNullOrEmpty(currAttr) && !string.IsNullOrEmpty(delimiter)){
                currAttr += delimiter;
            }
            this.setAttribute(key, currAttr + val);
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

        public string outerHTML
        {
            get
            {
                return this._node.OuterHtml;
            }
        }

        public List<HtmlAttributeFacade> attributes
        {
            get
            {
                return _node.Attributes.Select(attr => new HtmlAttributeFacade(attr)).ToList();
            }
        }

        public HtmlNodeFacade parentNode
        {
            get
            {
                if (this._node.ParentNode == null) return null;
                return new HtmlNodeFacade(this._node.ParentNode, this._ownerDoc);
            }
        }

        public List<HtmlNodeFacade> childNodes
        {
            get
            {
                var returnObj = new List<HtmlNodeFacade>();
                foreach (var child in _node.ChildNodes)
                {
                    returnObj.Add(new HtmlNodeFacade(child, this._ownerDoc));
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
            HtmlDocumentFacade.searchForNode(test, docNode, list, this._ownerDoc);
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
            return new HtmlNodeFacade(returnObj, this._ownerDoc);
        }

        public HtmlNodeFacade replaceChild(HtmlNodeFacade newChild, HtmlNodeFacade oldChild)
        {
            return new HtmlNodeFacade( this._node.ReplaceChild(newChild._node, oldChild._node), this._ownerDoc);
        }

        public HtmlNodeFacade insertBefore(HtmlNodeFacade newChild, HtmlNodeFacade refChild)
        {
            return new HtmlNodeFacade( this._node.InsertBefore(newChild._node, refChild._node), this._ownerDoc);
        }

        public HtmlNodeFacade insertAfter(HtmlNodeFacade newChild, HtmlNodeFacade refChild)
        {
            return new HtmlNodeFacade(this._node.InsertAfter(newChild._node, refChild._node), this._ownerDoc);
        }

        public void removeAttribute(string attrName)
        {
            _node.Attributes.Remove(attrName);
        }

        public void DoForThisAndAllAncestors(Action<HtmlNodeFacade> action)
        {
            action(this);
            foreach (var child in this.childNodes)
            {
                child.DoForThisAndAllAncestors(action);
            }
        }

    }
}
