using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClassGenMacros;

namespace CurlyBraceParser
{
    public partial class InterfaceStatement
    {
        public IOpenBraceStatement OpenBraceStatement { get; set; }
        public IHaveLiveStatement LiveStatementBase { get; set; }
        public ILine Line { get; set; }

        public InterfaceStatement(IOpenBraceStatement baseOpenBraceStatement)
        {
            this.OpenBraceStatement = baseOpenBraceStatement;
            this.LiveStatementBase = baseOpenBraceStatement.LiveStatementBase;
            this.Line = baseOpenBraceStatement.Line;
        }
    }

    public partial class InterfaceStatement : IInterface {
        public List<string> Extends { get; set; }

        public string Name { get; set; }

        public bool Public { get; set; }
    }

    public partial class InterfaceStatement : IOpenStatement
    {
        public List<ILine> Children { get { return this.OpenBraceStatement.Children; } set { this.OpenBraceStatement.Children = value; } }

        public string ClosingLineComment { get { return this.OpenBraceStatement.ClosingLineComment; } set { this.OpenBraceStatement.ClosingLineComment = value; } }

        public string OptionalLineSeparator { get { return this.OpenBraceStatement.OptionalLineSeparator; } set { this.OpenBraceStatement.OptionalLineSeparator = value; } }

        public string ClosingLine { get { return this.OpenBraceStatement.ClosingLine; } set { this.OpenBraceStatement.ClosingLine = value; } }
    }

    public partial class InterfaceStatement : IHaveLiveStatement
    {
        public string LiveStatement { get { return LiveStatementBase.LiveStatement; } set { LiveStatementBase.LiveStatement = value; } }

        public string FrontTrimmedLiveStatement { get { return LiveStatementBase.FrontTrimmedLiveStatement; } }
    }

    public partial class InterfaceStatement : ILine
    {
        public int LineNumber { get { return Line.LineNumber; } set { Line.LineNumber = value; } }

        public string FileName { get { return Line.FileName; } set { Line.FileName = value; } }


        public bool IncludeNextLine { get { return Line.IncludeNextLine; } set { Line.IncludeNextLine = value; } }


        public IOpenStatement Parent { get { return Line.Parent; } set { Line.Parent = value; } }

        public string Comment { get { return Line.Comment; } set { Line.Comment = value; } }
    }

    

#if TypeStrict
    public static class InterfaceInterpreter
    {
        #region Interface
        public const string InterfaceKeyword = "interface";

        public static bool IsInterface(this IHaveLiveStatement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.LiveStatement)) return false;
            var am = statement as IHaveAccessModifier;
            string statementWithoutPublicKeyword = (am!= null && am.Public) ? statement.GetStatementWithoutPublicKeyWord() : statement.LiveStatement;
            return statementWithoutPublicKeyword.StartsWith(InterfaceKeyword);
        }



        public static InterfaceStatement ToInterface(this IOpenBraceStatement statement)
        {
            string name = statement.GetStatementWithoutPublicKeyWord().Substring(InterfaceKeyword.Length + 1).TrimStart();
            name = name.SubstringBefore(' ', '{');
            var interfaceSt = new InterfaceStatement(statement)
            {
                Name = name,
                Public = statement.GetStatementIsPublic(),
            };
            return interfaceSt;
        }
        #endregion
    }
#endif

    //public class InterfaceMember
    //{
    //    public string Name { get; set; }
    //}

    //public class DataPropertyInterfaceMember : InterfaceMember
    //{
    //    public string Name { get; set; }
    //}

    
}
