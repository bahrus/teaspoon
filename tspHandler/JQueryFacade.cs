using System;
using System.Collections.Generic;

namespace tspHandler
{
    public class JQueryFacade
    {
        public string trim(string str)
        {
            return str.Trim();
        }

        public HtmlNodeFacade this[int index]
        {
            get
            {
                if (_nodes == null || _nodes.Count==0) return null;
                return _nodes[index];
            }
        }

        public int length
        {
            get
            {
                if (_nodes == null) return 0;
                return _nodes.Count;
            }
        }

        private HtmlDocumentFacade _doc;
        private List<HtmlNodeFacade> _nodes;
        public JQueryFacade(HtmlDocumentFacade doc)
        {
            _doc = doc;
        }


        

        public JQueryFacade jQuery(HtmlNodeFacade el)
        {
            var returnObj = new JQueryFacade(_doc)
            {
                _nodes = new List<HtmlNodeFacade>
                {
                    el,
                },
            };
            return returnObj;
        }

        public JQueryFacade jQuery(string selectorText)
        {
            var returnObj = new JQueryFacade(_doc)
            {
                _nodes = _doc.querySelectorAll(selectorText)
            };
            return returnObj;
        }

        public JQueryFacade jQuery()
        {

            var returnObj = new JQueryFacade(_doc)
            {
                _nodes = new List<HtmlNodeFacade>
                {
                },
            };
            return returnObj;
        }

        public string attr(string name)
        {
            if (_nodes == null || _nodes.Count == 0) return string.Empty;
            return _nodes[0].getAttribute(name);
        }

        public JQueryFacade attr(string name, string val)
        {
            if (_nodes == null) return this;
            foreach (var nd in _nodes)
            {
                nd.setAttribute(name, val);
            }
            return this;
        }

        //public string css(string name)
        //{
        //    if (_nodes == null || _nodes.Count == 0) return string.Empty;

        //}

        public string html()
        {
            if (_nodes == null || _nodes.Count == 0) return string.Empty;
            return _nodes[0].innerHTML;
        }

        public JQueryFacade html(string content)
        {
            if (_nodes == null || _nodes.Count == 0) return this;
            foreach (var node in _nodes)
            {
                node.innerHTML = content;
            }
            return this;
        }

        public object val()
        {
            if (_nodes == null || _nodes.Count == 0) return null;
            //TODO:  Selects are different
            return _nodes[0].value;
        }

        public void each(Action<HtmlNodeFacade> callBack)
        {
        }

    }
}
