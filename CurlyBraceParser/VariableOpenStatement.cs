using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{

    #region VariableOpenBraceStatement
    public partial class VariableOpenBraceStatement
    {
        public IOpenBraceStatement OpenBraceStatement { get; set; }
        public IHaveLiveStatement LiveStatementBase { get; set; }
        public ILine Line { get; set; }

        public VariableOpenBraceStatement(IOpenBraceStatement baseOpenBraceStatement)
        {
            this.OpenBraceStatement = baseOpenBraceStatement;
            this.LiveStatementBase = baseOpenBraceStatement.LiveStatementBase;
            this.Line = baseOpenBraceStatement.Line;
        }
    }

    public partial class VariableOpenBraceStatement : IVariable {
        public List<Parameter> Parameters { get; set; }
    }

    public partial class VariableOpenBraceStatement : IOpenStatement
    {
        public List<ILine> Children { get { return this.OpenBraceStatement.Children; } set { this.OpenBraceStatement.Children = value; } }

        public string ClosingLineComment { get { return this.OpenBraceStatement.ClosingLineComment; } set { this.OpenBraceStatement.ClosingLineComment = value; } }

        public string OptionalLineSeparator { get { return this.OpenBraceStatement.OptionalLineSeparator; } set { this.OpenBraceStatement.OptionalLineSeparator = value; } }

        public string ClosingLine { get { return this.OpenBraceStatement.ClosingLine; } set { this.OpenBraceStatement.ClosingLine = value; } }
    }

    public partial class VariableOpenBraceStatement : IHaveLiveStatement
    {
        public string LiveStatement { get { return LiveStatementBase.LiveStatement; } set { LiveStatementBase.LiveStatement = value; } }

        public string FrontTrimmedLiveStatement { get { return LiveStatementBase.FrontTrimmedLiveStatement; } }

    }

    public partial class VariableOpenBraceStatement : ILine
    {
        public int LineNumber { get { return Line.LineNumber; } set { Line.LineNumber = value; } }

        public string FileName { get { return Line.FileName; } set { Line.FileName = value; } }


        public bool IncludeNextLine { get { return Line.IncludeNextLine; } set { Line.IncludeNextLine = value; } }


        public IOpenStatement Parent { get { return Line.Parent; } set { Line.Parent = value; } }

        public string Comment { get { return Line.Comment; } set { Line.Comment = value; } }
    }
    #endregion

    public partial class VariableStatement
    {
        public IHaveLiveStatement LiveStatementBase { get; set; }
        public ILine Line { get; set; }

        public VariableStatement(IHaveLiveStatement baseLiveStatement)
        {
            this.LiveStatementBase = baseLiveStatement;
            this.Line = baseLiveStatement.Line;
        }
    }

    public partial class VariableStatement  : IHaveLiveStatement
    {
        public string LiveStatement { get { return LiveStatementBase.LiveStatement; } set { LiveStatementBase.LiveStatement = value; } }

        public string FrontTrimmedLiveStatement { get { return LiveStatementBase.FrontTrimmedLiveStatement; } }

    }

    public partial class VariableStatement : ILine
    {
        public int LineNumber { get { return Line.LineNumber; } set { Line.LineNumber = value; } }

        public string FileName { get { return Line.FileName; } set { Line.FileName = value; } }


        public bool IncludeNextLine { get { return Line.IncludeNextLine; } set { Line.IncludeNextLine = value; } }


        public IOpenStatement Parent { get { return Line.Parent; } set { Line.Parent = value; } }

        public string Comment { get { return Line.Comment; } set { Line.Comment = value; } }
    }

    //public partial class VariableStatement { }


#if TypeStrict
    public static class VarInterpreter
    {
        public const string VariableKeyword = "var";

        public static bool IsVariable(this Statement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.LiveStatement)) return false;
            string statementWithoutPublicKeyword = statement.GetStatementIsPublic() ? statement.GetStatementWithoutPublicKeyWord() : statement.LiveStatement;
            return statementWithoutPublicKeyword.StartsWith(VariableKeyword);
        }

        //public static VariableStatement ToVariableStatement(this Statement statement)
        //{
        //    string WithoutVariableKeyword = statement.GetStatementWithoutPublicKeyWord().Substring(VariableKeyword.Length + 1).TrimStart();
        //    var tokens = WithoutVariableKeyword.SplitOutsideQuotesAndTrim(',');
        //    List<Parameter> parameters = new List<Parameter>();
        //    foreach (string token in tokens)
        //    {
        //        var p = token.ToParameter(statement);
        //        parameters.Add(p);
        //    }
        //    var variableStatement = new VariableStatement(statement)
        //    {
        //        Parameters = parameters,
        //    };
        //    return variableStatement;
        //}
    }
#endif
}
