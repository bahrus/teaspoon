using ClassGenMacros;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace tspHandler
{
    public static partial class tspProcessor
    {

        public static HtmlDocumentFacade ProcessDifferences(HtmlDocumentFacade doc)
        {
            var urlSource = HttpContext.Current.Request["tsp-src"];
            if (urlSource != null)
            {
                return null;
            }
            HtmlDocumentFacade diffDoc = doc;
            doc.Trace("begindocInherits");
            var docInherits = doc.querySelectorAll("html>head>meta[name='inherits']");
            doc.Trace("enddocInherits");
            if (docInherits.Count == 0) return null;
            if (docInherits.Count > 1)
            {
                throw new ArgumentException("Cannot inherit from more than one page");
            }
            var metaEl = docInherits[0];
            var baseDocRelativeURL = metaEl.getAttribute("content");
            if (string.IsNullOrEmpty(baseDocRelativeURL)) throw new ArgumentException("No Content Attribute found");
            var inheritedContentFilePath = doc.GetHostContentFilePath(baseDocRelativeURL);
            var superHandler = new tspHandler(inheritedContentFilePath);
            HtmlDocumentFacade superDoc = superHandler.ProcessFile();

            //var nodeHierarchy = new Stack<HtmlNodeFacade>();
            //nodeHierarchy.Push(diffDoc.html);
            //var differenceStack = new Stack<NodeDifference>();
            //var differences = new List<NodeDifference>();
            //ProcessNode(nodeHierarchy, differenceStack, differences);
            //MergeDifferences(superDoc, differences);
            //return superDoc;
            ProcessTransform(superDoc.html, superDoc.html);
            return superDoc;
        }

        

        private static HtmlNodeFacade ProcessTransform(HtmlNodeFacade superDocNode, HtmlNodeFacade diffDocNode)
        {
            var diffNodeHierarchy = new Stack<HtmlNodeFacade>();
            diffNodeHierarchy.Push(diffDocNode);
            var differenceStack = new Stack<NodeDifference>();
            var differences = new List<NodeDifference>();
            ProcessNode(diffNodeHierarchy, differenceStack, differences);
            MergeDifferences(superDocNode, differences);
            return superDocNode;
        }

        

        private static void ProcessNode(Stack<HtmlNodeFacade> nodeHierarchy, Stack<NodeDifference> differenceStack, List<NodeDifference> result)
        {
            var currNode = nodeHierarchy.Peek();
            if (currNode.tagName == "#text") return;
            var merge = currNode.getAttribute("data-xmerge");
            if (string.IsNullOrEmpty(merge))
            {
                foreach (var child in currNode.childNodes)
                {
                    if (child.tagName == "#text") continue;
                    nodeHierarchy.Push(child);
                    ProcessNode(nodeHierarchy, differenceStack, result);
                    nodeHierarchy.Pop();
                }
            }
            else
            {
                var selector = getSelector(nodeHierarchy);

                var ndDiff = new NodeDifference
                {
                    Node = currNode,
                    Action = (NodeDiffAction)Enum.Parse(typeof(NodeDiffAction), merge),
                };
                if (differenceStack.Count > 0)
                {
                    var parent = differenceStack.Peek();
                    selector = selector.Substring(parent.MatchSelector.Length);
                    if (parent.Children == null) parent.Children = new List<NodeDifference>();
                    parent.Children.Add(ndDiff);
                }
                else
                {
                    result.Add(ndDiff);
                }
                ndDiff.MatchSelector = selector;
                differenceStack.Push(ndDiff);
                foreach (var child in currNode.childNodes)
                {
                    nodeHierarchy.Push(child);
                    ProcessNode(nodeHierarchy, differenceStack, result);
                    nodeHierarchy.Pop();
                }
                differenceStack.Pop();

            }
        }


        private static void MergeDifferences(INodeSelector source, List<NodeDifference> differences)
        {
            foreach (var diff in differences)
            {
                string selector = Fun.Val(() =>
                {
                    switch (diff.Action)
                    {
                        case NodeDiffAction.Append:
                            return diff.MatchSelector.SubstringBeforeLast(">");
                        case NodeDiffAction.Replace:
                            string ret = diff.MatchSelector;
                            if (diff.Node.hasAttribute(XMatchAttribute))
                            {
                                string attrib = diff.Node.getAttribute(XMatchAttribute);
                                string[] attribs = attrib.Split(',');
                                foreach (string matchingAttrib in attribs)
                                {
                                    string matchingAttribTrimmed = matchingAttrib.Trim();
                                    string val = diff.Node.getAttribute(matchingAttribTrimmed);
                                    ret += "[" + matchingAttribTrimmed;
                                    if (string.IsNullOrEmpty(val))
                                    {
                                        
                                    }
                                    else
                                    {
                                        ret += "='" + val + "'";
                                    }
                                    ret += "]";
                                }
                            }
                            return ret;
                        default:
                            throw new Exception();
                    }
                });
                var nodes = source.querySelectorAll(selector);
                if (nodes.Count != 1)
                {
                    throw new Exception("No Matching Single Node Found: " + diff.MatchSelector);
                }
                var node = nodes[0];
                var parentNode = node.parentNode;
                switch (diff.Action)
                {
                    case NodeDiffAction.Append:
                        node.appendChild(diff.Node);
                        break;
                    case NodeDiffAction.Replace:
                        parentNode.replaceChild(diff.Node, node);
                        break;
                    default:
                        throw new NotImplementedException();
                }
                if (diff.Children != null)
                {
                    MergeDifferences(node, diff.Children);
                }
            }
        }


        private static string getSelector(Stack<HtmlNodeFacade> nodeHierarchy)
        {
            var lst = nodeHierarchy.ToList()
                .Select(nd =>
                {
                    string tagSelector = nd.tagName.ToLower() + nd.getAttribute("xmatch");
                    return tagSelector;
                });
              return string.Join(">", lst.Reverse().ToArray());
        }
    }
}
