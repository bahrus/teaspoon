using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
    public partial class ModuleStatement
    {
        public IOpenBraceStatement OpenBraceStatement { get; set; }
        public IHaveLiveStatement LiveStatementBase { get; set; }
        public ILine Line { get; set; }

        public ModuleStatement(IOpenBraceStatement baseOpenBraceStatement)
        {
            this.OpenBraceStatement = baseOpenBraceStatement;
            this.LiveStatementBase = baseOpenBraceStatement.LiveStatementBase;
            this.Line = baseOpenBraceStatement.Line;
        }

    }

    public partial class ModuleStatement : IModule {
        public string FullName { get; set; }
    }

    public partial class ModuleStatement : IOpenBraceStatement {
        public List<ILine> Children { get { return this.OpenBraceStatement.Children; } set { this.OpenBraceStatement.Children = value; } }

        public string ClosingLineComment { get { return this.OpenBraceStatement.ClosingLineComment; } set { this.OpenBraceStatement.ClosingLineComment = value; } }

        public string OptionalLineSeparator { get { return this.OpenBraceStatement.OptionalLineSeparator; } set { this.OpenBraceStatement.OptionalLineSeparator = value; } }

        public string ClosingLine { get { return this.OpenBraceStatement.ClosingLine; } set { this.OpenBraceStatement.ClosingLine = value; } }
    }

    public partial class ModuleStatement : IHaveLiveStatement {
        public string LiveStatement { get { return LiveStatementBase.LiveStatement; } set { LiveStatementBase.LiveStatement = value; } }


        public string FrontTrimmedLiveStatement { get { return LiveStatementBase.FrontTrimmedLiveStatement; } }
    }

    public partial class ModuleStatement : ILine {
        public int LineNumber { get { return Line.LineNumber; } set { Line.LineNumber = value; } }

        public string FileName { get { return Line.FileName; } set { Line.FileName = value; } }


        public bool IncludeNextLine { get { return Line.IncludeNextLine; } set { Line.IncludeNextLine = value; } }


        public IOpenStatement Parent { get { return Line.Parent; } set { Line.Parent = value; } }

        public string Comment { get { return Line.Comment; } set { Line.Comment = value; } }
    }
    


#if TypeStrict
    public static class ModuleInterpreter
    {
        #region Module
        public const string ModuleKeyword = "module";
        
        public static bool IsModule(this IOpenBraceStatement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.LiveStatement)) return false;
            return statement.LiveStatementBase.FrontTrimmedLiveStatement.StartsWith(ModuleKeyword);
        }

        //public static ModuleStatement ToModule(this IOpenBraceStatement statement)
        //{
        //    string moduleName = statement.FrontTrimmedLiveStatement;
        //    moduleName = moduleName.Substring(ModuleKeyword.Length);
        //    moduleName = moduleName.TrimStart().SubstringBefore(' ', '{');
        //    var ms = new ModuleStatement
        //    {
        //        FullName = moduleName,
        //    };
        //    statement.CopyOpenStatementTo(ms);
        //    return ms;
        //}
        #endregion
    }
#endif
}
