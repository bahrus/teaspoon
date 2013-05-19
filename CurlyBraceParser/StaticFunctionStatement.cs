using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
    //public partial class StaticFunctionStatement
    //{
    //    public IOpenBraceStatement OpenBraceStatementBase { get; set; }
    //    public ILiveStatement LiveStatementBase { get; set; }
    //    public ILine Line { get; set; }
        
    //    public StaticFunctionStatement(IOpenBraceStatement baseOpenBraceStatement)
    //    {
    //        this.OpenBraceStatementBase = baseOpenBraceStatement;
    //        this.LiveStatementBase = baseOpenBraceStatement.LiveStatementBase;
    //        this.Line = baseOpenBraceStatement.Line;
    //    }
    //}

    //public partial class StaticFunctionStatement : IStaticFunction {
    //    public string Name { get; set; }

    //    public bool Public { get; set; }

    //    public List<Parameter> Args { get; set; }

    //    public string ReturnType { get; set; }
    //}

    //public partial class StaticFunctionStatement : IOpenStatement {
    //    public List<ILine> Children { get { return this.OpenBraceStatementBase.Children; } set { this.OpenBraceStatementBase.Children = value; } }

    //    public string ClosingLineComment { get { return this.OpenBraceStatementBase.ClosingLineComment; } set { this.OpenBraceStatementBase.ClosingLineComment = value; } }

    //    public string OptionalLineSeparator { get { return this.OpenBraceStatementBase.OptionalLineSeparator; } set { this.OpenBraceStatementBase.OptionalLineSeparator = value; } }

    //    public string ClosingLine { get { return this.OpenBraceStatementBase.ClosingLine; } set { this.OpenBraceStatementBase.ClosingLine = value; } }
    //}

    //public partial class StaticFunctionStatement : ILiveStatement {
    //    public string Statement { get { return LiveStatementBase.Statement; } set { LiveStatementBase.Statement = value; } }

    //    public string FrontTrimmedLiveStatement { get { return LiveStatementBase.FrontTrimmedLiveStatement; } }
    //}

    //public partial class StaticFunctionStatement : ILine {
    //    public int LineNumber { get { return Line.LineNumber; } set { Line.LineNumber = value; } }

    //    public string FileName { get { return Line.FileName; } set { Line.FileName = value; } }


    //    public bool IncludeNextLine { get { return Line.IncludeNextLine; } set { Line.IncludeNextLine = value; } }


    //    public IOpenStatement Parent { get { return Line.Parent; } set { Line.Parent = value; } }

    //    public string Comment { get { return Line.Comment; } set { Line.Comment = value; } }
    //}


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



        //public static StaticFunctionStatement ToFunction(this OpenBraceStatementBase statement)
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
