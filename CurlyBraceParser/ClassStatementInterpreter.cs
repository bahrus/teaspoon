using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;


namespace CurlyBraceParser
{

#if TypeStrict
    public static class ClassStatementInterpreter
    {
        #region Class
        public const string ClassKeyword = "class";

        public static bool IsClass(this ILiveStatement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.Statement)) return false;
            string statementWithoutPublicKeyword = statement.GetStatementIsPublic() ? statement.GetStatementWithoutPublicKeyWord() : statement.Statement;
            return statementWithoutPublicKeyword.StartsWith(ClassKeyword);
        }

        //public static ClassStatement ToClass(this OpenBraceStatementBase statement)
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

        public static string GetClassName(this IOpenBraceStatement statement)
        {
            string name = statement.GetStatementWithoutPublicKeyWord().Substring(ClassKeyword.Length + 1).TrimStart();
            return name;
        }

        #endregion
    }
#endif
}
