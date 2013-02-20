using System.Collections.Generic;
using System.IO;

namespace CurlyBraceParser
{
    public abstract class OpenStatement : Statement
    {
        public List<Line> Children { get; set; }
        public string ClosingLineComment { get; set; }
        public string OptionalLineSeparator { get; set; }
        public string ClosingLine { get; set; }

        public override string Content
        {
            get
            {
                StringWriter sw = new StringWriter();
                sw.WriteLine(base.Content);
                foreach (var child in Children)
                {
                    sw.WriteLine(child.Content);
                }
                sw.WriteLine(this.ClosingLine + this.OptionalLineSeparator + this.ClosingLineComment);
                return sw.ToString();
            }
        }

        public void CopyOpenStatementTo(OpenStatement To)
        {
            this.CopyLinePropsTo(To);
            this.CopyStatementPropsTo(To);
            To.Children = this.Children;
            if (To.Children != null)
            {
                foreach (var child in To.Children)
                {
                    child.Parent = To;
                }
            }
            To.ClosingLine = this.ClosingLine;
            To.ClosingLineComment = this.ClosingLineComment;
            To.OptionalLineSeparator = this.OptionalLineSeparator;
        }
    }
}
