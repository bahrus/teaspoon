using HtmlAgilityPack;
using System;
using System.Collections.Generic;

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

        public List<HtmlNode> getElementsByTagName(string tag)
        {
            var docNode = this._htmlDoc.DocumentNode;
            var list = new List<HtmlNode>();
            Func<HtmlNode, bool> test = node =>
            {
                return node.Name == tag;
            };
            searchForNode(test, docNode, list);
            return list;
        }

        private void searchForNode(Func<HtmlNode, bool> test, HtmlNode node, List<HtmlNode> nodes)
        {
            if (test(node))
            {
                nodes.Add(node);
            }
            foreach (var child in node.ChildNodes)
            {
                searchForNode(test, child, nodes);
            }
        }
    }
}
