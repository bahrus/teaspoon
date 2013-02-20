﻿
namespace CurlyBraceParser
{
    public class Line
    {
        public int LineNumber { get; set; }
        public bool IncludeNextLine { get; set; }
        public OpenStatement Parent { get; set; }
        public string Comment { get; set; }
        public virtual string Content
        {
            get { return Comment; }
        }

        public void CopyLinePropsTo(Line To)
        {
            To.LineNumber = this.LineNumber;
            To.IncludeNextLine = this.IncludeNextLine;
            To.Parent = this.Parent;
            To.Comment = this.Comment;
        }
    }

    
}