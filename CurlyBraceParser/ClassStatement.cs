using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
    public partial class ClassStatement 
    {
        public IOpenBraceStatement OpenBraceStatement { get; set; }
        public IHaveLiveStatement LiveStatementBase { get; set; }
        public ILine Line { get; set; }

        public ClassStatement(IOpenBraceStatement baseOpenBraceStatement)
        {
            this.OpenBraceStatement = baseOpenBraceStatement;
            this.LiveStatementBase = baseOpenBraceStatement.LiveStatementBase;
            this.Line = baseOpenBraceStatement.Line;
        }
    }

    public partial class ClassStatement : IClass {
        public List<string> Implements { get; set; }
        public bool Public { get; set; }
        public string Name { get; set; }
    }

    public partial class ClassStatement : IOpenBraceStatement
    {
        public List<ILine> Children { get { return this.OpenBraceStatement.Children; } set { this.OpenBraceStatement.Children = value; } }

        public string ClosingLineComment { get { return this.OpenBraceStatement.ClosingLineComment; } set { this.OpenBraceStatement.ClosingLineComment = value; } }

        public string OptionalLineSeparator { get { return this.OpenBraceStatement.OptionalLineSeparator; } set { this.OpenBraceStatement.OptionalLineSeparator = value; } }

        public string ClosingLine { get { return this.OpenBraceStatement.ClosingLine; } set { this.OpenBraceStatement.ClosingLine = value; } }
    }

    public partial class ClassStatement : IHaveLiveStatement
    {
        public string LiveStatement { get { return LiveStatementBase.LiveStatement; } set { LiveStatementBase.LiveStatement = value; } }

        public string FrontTrimmedLiveStatement { get { return LiveStatementBase.FrontTrimmedLiveStatement; } }
    }

    public partial class ClassStatement : ILine
    {
        public int LineNumber { get { return Line.LineNumber; } set { Line.LineNumber = value; } }

        public string FileName { get { return Line.FileName; } set { Line.FileName = value; } }


        public bool IncludeNextLine { get { return Line.IncludeNextLine; } set { Line.IncludeNextLine = value; } }


        public IOpenStatement Parent { get { return Line.Parent; } set { Line.Parent = value; } }

        public string Comment { get { return Line.Comment; } set { Line.Comment = value; } }
    }


#if TypeStrict
    public static class ClassStatementInterpreter
    {
        #region Class
        public const string ClassKeyword = "class";

        public static bool IsClass(this IHaveLiveStatement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.LiveStatement)) return false;
            string statementWithoutPublicKeyword = statement.GetStatementIsPublic() ? statement.GetStatementWithoutPublicKeyWord() : statement.LiveStatement;
            return statementWithoutPublicKeyword.StartsWith(ClassKeyword);
        }

        //public static ClassStatement ToClass(this OpenBraceStatement statement)
        //{
        //    string name = statement.GetStatementWithoutPublicKeyWord().Substring(ClassKeyword.Length + 1).TrimStart();
        //    name = name.SubstringBefore(' ', '{');
        //    var classStatement = new ClassStatement
        //    {
        //        Name = name,
        //        Public = statement.GetStatementIsPublic(),
        //    };
        //    statement.CopyOpenStatementTo(classStatement);
        //    return classStatement;

        //}

        #endregion
    }
#endif
}
