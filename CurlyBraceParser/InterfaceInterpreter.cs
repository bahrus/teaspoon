using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using ClassGenMacros;

namespace CurlyBraceParser
{
    
#if TypeStrict
    public static class InterfaceInterpreter
    {
        #region Interface
        public const string InterfaceKeyword = "interface";

        public static bool IsInterface(this ILiveStatement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.Statement)) return false;
            var am = statement as IHaveAccessModifier;
            string statementWithoutPublicKeyword = (am!= null && am.Public) ? statement.GetStatementWithoutPublicKeyWord() : statement.Statement;
            return statementWithoutPublicKeyword.StartsWith(InterfaceKeyword);
        }




        #endregion
    }
#endif

    
}
