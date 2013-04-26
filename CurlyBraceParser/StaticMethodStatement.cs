using System.Collections.Generic;

namespace CurlyBraceParser
{
    public partial class StaticMethodStatement : IOpenBraceStatement
    {
        

        public IOpenBraceStatement OpenBraceStatement { get; set; }
        public IHaveLiveStatement LiveStatementBase { get; set; }
        public ILine Line { get; set; }

        public StaticMethodStatement(IOpenBraceStatement baseOpenBraceStatement)
        {
            this.OpenBraceStatement = baseOpenBraceStatement;
            this.LiveStatementBase = baseOpenBraceStatement.LiveStatementBase;
            this.Line = baseOpenBraceStatement.Line;
        }
    }

    public partial class StaticMethodStatement : IStaticInterfaceMethod
    {
        public string Name { get; set; }

        public List<Statement> Parameters { get; set; }

        public string ReturnType { get; set; }
    }

    public partial class StaticMethodStatement
    {
        public List<ILine> Children { get { return this.OpenBraceStatement.Children; } set { this.OpenBraceStatement.Children = value; } }

        public string ClosingLineComment { get { return this.OpenBraceStatement.ClosingLineComment; } set { this.OpenBraceStatement.ClosingLineComment = value; } }

        public string OptionalLineSeparator { get { return this.OpenBraceStatement.OptionalLineSeparator; } set { this.OpenBraceStatement.OptionalLineSeparator = value; } }

        public string ClosingLine { get { return this.OpenBraceStatement.ClosingLine; } set { this.OpenBraceStatement.ClosingLine = value; } }
    }

    public partial class StaticMethodStatement : ILine
    {
        public int LineNumber { get { return Line.LineNumber; } set { Line.LineNumber = value; } }

        public string FileName { get { return Line.FileName; } set { Line.FileName = value; } }


        public bool IncludeNextLine { get { return Line.IncludeNextLine; } set { Line.IncludeNextLine = value; } }


        public IOpenStatement Parent { get { return Line.Parent; } set { Line.Parent = value; } }

        public string Comment { get { return Line.Comment; } set { Line.Comment = value; } }
    }

    public partial class StaticMethodStatement : IHaveLiveStatement
    {
        public string LiveStatement { get { return LiveStatementBase.LiveStatement; } set { LiveStatementBase.LiveStatement = value; } }


        public string FrontTrimmedLiveStatement { get { return LiveStatementBase.FrontTrimmedLiveStatement; } }
    }
}
