using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace tspHandler
{
    public class StyleDirective : IComparable<StyleDirective>
    {
        public CssRule Rule { get; set; }
        public HtmlNodeFacade Node { get; set; }
        public int DocOrder { get; set; }
        private string _compiler;
        public string Compiler
        {
            get
            {
                if (_compiler == null)
                {
                    _compiler = Node.getAttribute(tspProcessor.CompilerAttribute);
                }
                return _compiler;
            }
        }
        private int? _specifity;
        public int Specifity
        {
            get
            {
                if (_specifity == null)
                {
                    _specifity = CssSelectorHelper.CalculateSpecificity(Rule.selectorText);
                    throw new NotImplementedException();
                }
                return (int) _specifity;
            }
        }

        public List<StyleDirective> AttributeDirectives { get; set; }

        public List<StyleDirective> AttributeDirectivesNN
        {
            get
            {
                if (AttributeDirectives == null)
                {
                    AttributeDirectives = new List<StyleDirective>();
                }
                return AttributeDirectives;
            }
        }
        public int CompareTo(StyleDirective other)
        {
            if (this.Compiler != other.Compiler) return this.Compiler.CompareTo(other.Compiler);
            if (this.Specifity != other.Specifity) return this.Specifity.CompareTo(other.Specifity);
            return this.DocOrder.CompareTo(other.DocOrder);
            
        }
    }
}
