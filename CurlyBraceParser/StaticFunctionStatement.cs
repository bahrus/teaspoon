using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
    public partial class StaticFunctionStatement
    {
        public IOpenBraceStatement OpenBraceStatement { get; set; }
        public ILiveStatement LiveStatementBase { get; set; }
        public ILine Line { get; set; }
        
        public StaticFunctionStatement(IOpenBraceStatement baseOpenBraceStatement)
        {
            this.OpenBraceStatement = baseOpenBraceStatement;
            this.LiveStatementBase = baseOpenBraceStatement.LiveStatementBase;
            this.Line = baseOpenBraceStatement.Line;
        }
    }

    public partial class StaticFunctionStatement : IStaticFunction {
        public string Name { get; set; }

        //public string FullName
        //{
        //    get
        //    {
        //        var mod = this.Parent as ModuleStatement;
        //        if (mod != null)
        //        {
        //            return mod.FullName + "." + this.Name;
        //        }
        //        else
        //        {
        //            return this.Name;
        //        }
        //    }
        //}

        public bool Public { get; set; }

        public List<Parameter> Args { get; set; }

        public string ReturnType { get; set; }
    }

    public partial class StaticFunctionStatement : IOpenStatement {
        public List<ILine> Children { get { return this.OpenBraceStatement.Children; } set { this.OpenBraceStatement.Children = value; } }

        public string ClosingLineComment { get { return this.OpenBraceStatement.ClosingLineComment; } set { this.OpenBraceStatement.ClosingLineComment = value; } }

        public string OptionalLineSeparator { get { return this.OpenBraceStatement.OptionalLineSeparator; } set { this.OpenBraceStatement.OptionalLineSeparator = value; } }

        public string ClosingLine { get { return this.OpenBraceStatement.ClosingLine; } set { this.OpenBraceStatement.ClosingLine = value; } }
    }

    public partial class StaticFunctionStatement : ILiveStatement {
        public string Statement { get { return LiveStatementBase.Statement; } set { LiveStatementBase.Statement = value; } }

        public string FrontTrimmedLiveStatement { get { return LiveStatementBase.FrontTrimmedLiveStatement; } }
    }

    public partial class StaticFunctionStatement : ILine {
        public int LineNumber { get { return Line.LineNumber; } set { Line.LineNumber = value; } }

        public string FileName { get { return Line.FileName; } set { Line.FileName = value; } }


        public bool IncludeNextLine { get { return Line.IncludeNextLine; } set { Line.IncludeNextLine = value; } }


        public IOpenStatement Parent { get { return Line.Parent; } set { Line.Parent = value; } }

        public string Comment { get { return Line.Comment; } set { Line.Comment = value; } }
    }


#if TypeStrict
    public static class StaticFunctionInterpreter
    {
        #region Function
        public const string FunctionKeyword = "function";

        public static string GetFullName(this IStaticFunction staticFunc)
        {
            
            var mod = staticFunc.Parent as IModule;
            if (mod != null)
            {
                return mod.FullName + "." + staticFunc.Name;
            }
            else
            {
                return staticFunc.Name;
            }
        }

        public static bool IsFunction(this ILiveStatement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.Statement)) return false;
            string statementWithoutPublicKeyword = statement.GetStatementIsPublic() ? statement.GetStatementWithoutPublicKeyWord() : statement.Statement;
            return statementWithoutPublicKeyword.StartsWith(FunctionKeyword);
        }



        //public static StaticFunctionStatement ToFunction(this OpenBraceStatement statement)
        //{
        //    string signatureWithoutFunctionKeyWord =  statement.GetStatementWithoutPublicKeyWord().Substring(FunctionKeyword.Length + 1).TrimStart();
        //    string name = signatureWithoutFunctionKeyWord.SubstringBefore(' ', '(');
        //    string signaturePlus = signatureWithoutFunctionKeyWord.Substring(name.Length).TrimStart();
        //    string signature = signaturePlus.Substring(1).SubstringBefore(')');
        //    string returnInfo = statement.GetStatementWithoutPublicKeyWord().SubstringAfter(")").SubstringAfter(":").TrimStart();
        //    string returnType = null;
        //    if (string.IsNullOrEmpty(returnInfo))
        //    {
        //        returnType = "void";
        //    }
        //    else
        //    {
        //        returnType = returnInfo.SubstringBefore(' ', '{');
        //    }
        //    string[] functionArgs = signature.Split(',');
        //    var parameterList = new List<Parameter>();
        //    foreach (string arg in functionArgs)
        //    {
        //        if(string.IsNullOrEmpty(arg)) continue;
        //        var p = arg.ToParameter(statement);
        //        parameterList.Add(p);
        //    }
        //    //string fullName = name;
        //    //var modParent = statement.Parent as ModuleStatement;
        //    //if (modParent != null)
        //    //{
        //    //    fullName = modParent.FullName + "." + fullName;
        //    //}
        //    var functionStatement = new StaticFunctionStatement
        //    {
        //        //FullName = fullName,
        //        Name = name,
        //        Public = statement.GetStatementIsPublic(),
        //        Args = parameterList,
        //        ReturnType = returnType,
        //    };
        //    statement.CopyOpenStatementTo(functionStatement);
        //    return functionStatement;
        //}
        #endregion
    }
#endif
}
