using System.Collections.Generic;

namespace tspHandler
{
    public class JQueryFacade
    {


        public HtmlNodeFacade this[int index]
        {
            get
            {
                if (_nodes == null || _nodes.Count==0) return null;
                return _nodes[index];
            }
        }

        private HtmlDocumentFacade _doc;
        private List<HtmlNodeFacade> _nodes;
        public JQueryFacade(HtmlDocumentFacade doc)
        {
            _doc = doc;
        }


        public JQueryFacade jQuery()
        {
            return this;
        }

        public JQueryFacade jQuery(HtmlNodeFacade el)
        {
            _nodes = new List<HtmlNodeFacade>
            {
                el,
            };
            return this;
        }

        public JQueryFacade jQuery(string selectorText)
        {
            _nodes = _doc.querySelectorAll(selectorText);
            return this;
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

    }
}
