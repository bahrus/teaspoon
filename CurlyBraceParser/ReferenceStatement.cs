using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClassGenMacros;

namespace CurlyBraceParser
{
    public partial class ReferenceStatement : IReferenceStatement
    {
        public string ClientSideReference { get; set; }

        public ILine Line { get; set; }

        public ReferenceStatement(ILine Line)
        {
            this.Line = Line;
        }
        
    }

    public partial class ReferenceStatement : ILine {
        public int LineNumber { get { return Line.LineNumber; } set { Line.LineNumber = value; } }

        public string FileName { get { return Line.FileName; } set { Line.FileName = value; } }


        public bool IncludeNextLine { get { return Line.IncludeNextLine; } set { Line.IncludeNextLine = value; } }


        public IOpenStatement Parent { get { return Line.Parent; } set { Line.Parent = value; } }

        public string Comment { get { return Line.Comment; } set { Line.Comment = value; } }
    }

    #if TypeStrict
    public static class ReferenceInterpreter
    {
        #region References
        public const string referenceLink = "/<reference path=";
        public static bool IsReference(this ILine line)
        {
            var statement = line as IHaveLiveStatement;
            if (statement != null) return false;
            if (string.IsNullOrEmpty(line.Comment)) return false;
            return line.Comment.StartsWith(referenceLink);
        }

        public static ReferenceStatement ToReferenceStatement(this Line line)
        {
            string path = line.Comment.SubstringBetween(referenceLink).And("/>");
            if (string.IsNullOrEmpty(path)) throw new Exception("No Path found in " + line.Comment);
            path = path.Trim().Replace("\"", "").Replace("'", "");
            var refStatement = new ReferenceStatement(line)
            {
                ClientSideReference = path,
            };
            return refStatement;
        }
        #endregion

        
    }

    
    #endif
}
