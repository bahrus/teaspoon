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
            //var am = statement as IHaveAccessModifier;
            //string statementWithoutPublicKeyword = (am!= null && am.Public) ? statement.GetStatementWithoutPublicKeyWord() : statement.Statement;
            string statementWithoutPublicKeyword = statement.GetStatementIsPublic() ? statement.GetStatementWithoutPublicKeyWord() : statement.Statement;
            return statementWithoutPublicKeyword.StartsWith(InterfaceKeyword);
        }


        public static string GetInterfaceName(this IOpenBraceStatement statement)
        {
            string signatureWithoutInterfaceKeyWord = statement.GetStatementWithoutPublicKeyWord().Substring(InterfaceKeyword.Length + 1).TrimStart();
            string name = signatureWithoutInterfaceKeyWord.SubstringBefore(' ', '{');
            return name;
        }

        public static Interface Process(this Interface iface)
        {
            var afterExtends = iface.GetStatementWithoutPublicKeyWord().SubstringAfter("extends").SubstringBefore("{");
            afterExtends = afterExtends.Replace(" ", "");
            var extenders = afterExtends.Split(',');
            iface.Extends = extenders.ToList();
            if (iface.Children != null)
            {
                var JSDoc = new StringBuilder();
                foreach (var line in iface.Children)
                {
                    var ls = line as LiveStatement;
                    if (ls == null)
                    {
                        var comment = line.Comment.Trim();
                        if (comment.StartsWith("*"))
                        {
                            JSDoc.Append(comment.Substring(1));
                        }
                        continue;
                    }
                    var ftls = ls.FrontTrimmedLiveStatement;
                    if (ftls.Trim() == string.Empty) continue;
                    if (!ftls.Contains("("))
                    {
                        string name = ftls.SubstringBefore(":").Trim();
                        bool optional = name.EndsWith("?");
                        if (optional) name = name.TrimEnd('?');
                        var de = new Field
                        {
                            Name = name,
                            Type = ftls.SubstringAfter(":").SubstringBefore(";").Trim(),
                            Optional = optional,
                            HelpText = JSDoc.ToString(),
                        };
                        JSDoc.Clear();
                        if (iface.Fields == null) iface.Fields = new List<IField>();
                        iface.Fields.Add(de);
                    }
                }
            }
            return iface;
        }

        #endregion
    }
#endif

    
}
