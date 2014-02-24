using System;
using System.Collections.Generic;
using System.Linq;
using ClassGenMacros;

namespace tspHandler
{
    public class JQueryFacade
    {
        //[ThreadStatic]
        //private static Dictionary<HtmlNodeFacade, Dictionary<string, object>> _data;

        public string trim(string str)
        {
            return str.Trim();
        }

        //public object data(HtmlNodeFacade el, string key = null, object val = null)
        //{
        //    if (_data == null) _data = new Dictionary<HtmlNodeFacade, Dictionary<string, object>>();
        //    if (!_data.ContainsKey(el))
        //    {
        //        _data[el] = new Dictionary<string, object>();
        //    }
        //    var d = _data[el];
        //    if (key == null)
        //    {
        //        return d;
        //    }
        //    if (val == null)
        //    {
        //        if (d.ContainsKey(key)) return d[key];
        //    }
        //    d[key] = val;
        //    return val;
        //}

        //public Dictionary<string,object> data()
        //{
        //    if (_nodes == null || _nodes.Count == 0) return null;
        //    if (_nodes.Count > 1) throw new NotImplementedException();
        //    if (_data == null) _data = new Dictionary<HtmlNodeFacade,Dictionary<string,object>>();
        //    var el = _nodes[0];
        //    if (!_data.ContainsKey(el))
        //    {
        //        _data[el] = new Dictionary<string,object>();
        //    }
        //    return _data[el];
        //}
        

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
            if (selectorText.StartsWith("<"))
            {
                if (selectorText.Contains(" "))
                {
                    throw new NotImplementedException();
                }
                string tag = selectorText.SubstringAfter("<").SubstringBeforeLast("/>");
                if (tag.Contains("<"))
                {
                    throw new NotImplementedException();
                }
                //return new JQueryFacade(_doc)
                //{
                //    _nodes = new List<HtmlNodeFacade>{
                //        _doc.createElement(tag),
                //    }
                //};
                _nodes = new List<HtmlNodeFacade>{
                    _doc.createElement(tag),
                };
                return this;
            }
            else
            {
                var returnObj = new JQueryFacade(_doc)
                {
                    _nodes = _doc.querySelectorAll(selectorText)
                };
                return returnObj;
            }
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

        public JQueryFacade append(JQueryFacade inner)
        {
            if (this._nodes == null) return this;
            if (inner._nodes == null) return this;
            foreach (var parentNode in this._nodes)
            {
                foreach (var childNode in inner._nodes)
                {
                    parentNode.appendChild(childNode);
                }
            }
            return this;
        }

        public JQueryFacade find(string selectorText)
        {
            var newNodes = new List<HtmlNodeFacade>();
            if (_nodes != null)
            {
                foreach (var nd in _nodes)
                {
                    newNodes.AddRange(nd.querySelectorAll(selectorText));
                }
            }
            else
            {
                newNodes.AddRange(_doc.querySelectorAll(selectorText));
            }
            var returnObj = new JQueryFacade(_doc)
            {
                _nodes = newNodes,
            };
            return returnObj;
        }

        public JQueryFacade addClass(string className)
        {
            //if (string.IsNullOrEmpty(className)) return this;
            //string[] classNames = className.Split(' ');
            //foreach (var nd in _nodes)
            //{
            //    string currClassName = nd.className;
            //    if (string.IsNullOrEmpty(currClassName))
            //    {
            //        nd.className = className;
            //    }
            //    else
            //    {
            //        var currClassNames = currClassName.Split(' ').ToList();
            //        foreach (string defunctClassName in classNames)
            //        {
            //            if (!currClassNames.Contains(defunctClassName))
            //            {
            //                currClassNames.Add(defunctClassName);
            //            }
            //        }
            //        nd.className = string.Join(" ", currClassNames.ToArray());
            //    }

            //}
            //return this;
            foreach (var nd in _nodes)
            {
                nd.className = className;
            }
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
