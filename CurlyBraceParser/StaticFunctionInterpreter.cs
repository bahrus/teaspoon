using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ClassGenMacros;


namespace CurlyBraceParser
{


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

        public static string GetFunctionName(this IOpenBraceStatement statement)
        {
            string signatureWithoutFunctionKeyWord = statement.GetStatementWithoutPublicKeyWord().Substring(FunctionKeyword.Length + 1).TrimStart();
            string name = signatureWithoutFunctionKeyWord.SubstringBefore(' ', '(');
            return name;
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
