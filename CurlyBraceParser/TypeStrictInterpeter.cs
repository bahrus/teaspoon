using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
#if TypeStrict
    public static class TypeStrictInterpeter
    {
        #region Module
        public const string ModuleKeyword = "module";
        public static bool IsModule(this OpenBraceStatement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.LiveStatement)) return false;
            return statement.FrontTrimmedLiveStatement.StartsWith(ModuleKeyword);
        }

        public static ModuleStatement ToModule(this OpenBraceStatement statement)
        {
            string moduleName = statement.FrontTrimmedLiveStatement;
            moduleName = moduleName.Substring(ModuleKeyword.Length);
            moduleName = moduleName.TrimStart().SubstringBefore(' ', '{');
            var ms = new ModuleStatement
            {
                Children                = statement.Children,
                ClosingLine             = statement.ClosingLine,
                ClosingLineComment      = statement.ClosingLineComment,
                Comment                 = statement.Comment,
                FullName                = moduleName,
                IncludeNextLine         = statement.IncludeNextLine,
                LineNumber              = statement.LineNumber,
                LiveStatement           = statement.LiveStatement,
                OptionalLineSeparator   = statement.OptionalLineSeparator,
                Parent                  = statement.Parent,
            };
            return ms;
        }
        #endregion

        #region variable
        public const string VariableKeyword = "var";
        /// <summary>
        /// Only support either typed open statement or primitive or module alias
        /// </summary>
        /// <param name="statement"></param>
        /// <returns></returns>
        public static bool IsVariableDef(this Statement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.LiveStatement)) return false;
            return statement.FrontTrimmedLiveStatement.StartsWith(VariableKeyword);
        }

        //public static VariableOpenBraceStatement To
        #endregion


        public static List<Line> GetOutline(this List<Line> lines)
        {
            var returnObj = new List<Line>();
            foreach (var line in lines)
            {
                GetOutline(line, returnObj);
                
            }
            return returnObj;
        }

        private static void GetOutline(Line line, List<Line> OutputLines)
        {
            
            var statement = line as OpenBraceStatement;
            if (statement == null)
            {
                OutputLines.Add(line);
                return;
            }
            
            if (statement.IsModule())
            {
                statement = statement.ToModule();
                
            }
            OutputLines.Add(statement);
            if (statement.Children != null)
            {
                var newc = new List<Line>();
                foreach (var childLine in statement.Children)
                {
                    GetOutline(childLine, newc);
                }
                statement.Children = newc;
            }
        }
    }
#endif
}
