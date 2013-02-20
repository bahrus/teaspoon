using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
    public class ClassStatement : InterfaceStatement
    {
        public List<string> Implements { get; set; }
        public bool Public { get; set; }
    }
#if TypeStrict
    public static class ClassStatementInterpreter
    {
        #region Class
        public const string ClassKeyword = "class";

        public static bool IsClass(this Statement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.LiveStatement)) return false;
            string statementWithoutPublicKeyword = statement.GetStatementIsPublic() ? statement.GetStatementWithoutPublicKeyWord() : statement.LiveStatement;
            return statementWithoutPublicKeyword.StartsWith(ClassKeyword);
        }

        public static ClassStatement ToClass(this OpenBraceStatement statement)
        {
            string name = statement.GetStatementWithoutPublicKeyWord().Substring(ClassKeyword.Length + 1).TrimStart();
            name = name.SubstringBefore(' ', '{');
            var classStatement = new ClassStatement
            {
                Name = name,
                Public = statement.GetStatementIsPublic(),
            };
            statement.CopyOpenStatementTo(classStatement);
            return classStatement;

        }

        #endregion
    }
#endif
}
