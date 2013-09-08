using System.Collections.Generic;

namespace tspHandler
{
    public class JQueryFacade
    {
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

    }
}
