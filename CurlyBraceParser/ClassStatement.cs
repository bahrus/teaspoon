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
            if (statement.FrontTrimmedLiveStatement.StartsWith(ClassKeyword))
            {
                return true;
            }
            if (statement.FrontTrimmedLiveStatement.StartsWith(TypeStrictInterpreter.PublicKeyword))
            {
                string start = statement.FrontTrimmedLiveStatement.Substring(TypeStrictInterpreter.PublicKeyword.Length);
                if (start.TrimStart().StartsWith(ClassKeyword)) return true;
            }
            return false;
        }

        public static ClassStatement ToClass(this OpenBraceStatement statement)
        {
            string first = statement.FrontTrimmedLiveStatement.SubstringBefore(' ', '{');
            bool isPublic = false;
            string name = null;
            if (first == TypeStrictInterpreter.PublicKeyword)
            {
                isPublic = true;
                name = statement.FrontTrimmedLiveStatement.Substring(TypeStrictInterpreter.PublicKeyword.Length).TrimStart();
                name = name.Substring(ClassKeyword.Length).TrimStart();
                name = name.SubstringBefore(' ', '{');
            }
            var classStatement = new ClassStatement
            {
                Name = name,
                Public = isPublic,
                Children = statement.Children,
                ClosingLine = statement.ClosingLine,
                ClosingLineComment = statement.ClosingLineComment,
                Comment = statement.Comment,
                IncludeNextLine = statement.IncludeNextLine,
                LineNumber = statement.LineNumber,
                LiveStatement = statement.LiveStatement,
                OptionalLineSeparator = statement.OptionalLineSeparator,
                Parent = statement.Parent,
            };
            return classStatement;

        }

        #endregion
    }
#endif
}
