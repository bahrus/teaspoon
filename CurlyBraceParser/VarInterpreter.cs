using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{

#if TypeStrict
    public static class VarInterpreter
    {
        public const string VariableKeyword = "var";

        public static bool IsVariable(this LiveStatement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.Statement)) return false;
            string statementWithoutPublicKeyword = statement.GetStatementIsPublic() ? statement.GetStatementWithoutPublicKeyWord() : statement.Statement;
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
