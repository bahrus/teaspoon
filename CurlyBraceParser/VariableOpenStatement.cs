using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{

    public class VariableOpenBraceStatement : OpenBraceStatement
    {
        public List<Parameter> Parameters { get; set; }
    }


    public class VariableStatement : Statement
    {
        public List<Parameter> Parameters { get; set; }
    }

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

        public static VariableStatement ToVariableStatement(this Statement statement)
        {
            string WithoutVariableKeyword = statement.GetStatementWithoutPublicKeyWord().Substring(VariableKeyword.Length + 1).TrimStart();
            var tokens = WithoutVariableKeyword.SplitOutsideQuotesAndTrim(',');
            List<Parameter> parameters = new List<Parameter>();
            foreach (string token in tokens)
            {
                var p = token.ToParameter(statement);
                parameters.Add(p);
            }
            var variableStatement = new VariableStatement
            {
                Parameters = parameters,
            };
            return variableStatement;
        }
    }
#endif
}
