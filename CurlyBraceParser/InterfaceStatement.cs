using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
    public class InterfaceStatement : OpenBraceStatement, ICanBePublicStatement
    {
        public List<string> Extends { get; set; }

        public string Name { get; set; }

        public bool Public { get; set; }
    }

#if TypeStrict
    public static class InterfaceInterpreter
    {
        #region Interface
        public const string InterfaceKeyword = "interface";

        public static bool IsInterface(this Statement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.LiveStatement)) return false;
            string statementWithoutPublicKeyword = statement.GetStatementIsPublic() ? statement.GetStatementWithoutPublicKeyWord() : statement.LiveStatement;
            return statementWithoutPublicKeyword.StartsWith(InterfaceKeyword);
        }



        public static InterfaceStatement ToInterface(this OpenBraceStatement statement)
        {
            string name = statement.GetStatementWithoutPublicKeyWord().Substring(InterfaceKeyword.Length + 1).TrimStart();
            name = name.SubstringBefore(' ', '{');
            var interfaceSt = new InterfaceStatement
            {
                Name = name,
                Public = statement.GetStatementIsPublic(),
            };
            statement.CopyOpenStatementTo(interfaceSt);
            return interfaceSt;
        }
        #endregion
    }
#endif
}
