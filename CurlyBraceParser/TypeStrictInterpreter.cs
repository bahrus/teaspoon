using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
#if TypeStrict
    public static class TypeStrictInterpreter
    {

        public const string PublicKeyword = "export";

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

        public static List<Line> GetOutline(this List<Line> lines, ProcessedFile pf)
        {
            var returnObj = new List<Line>();
            foreach (var line in lines)
            {
                GetOutline(line, returnObj, pf);
                
            }
            return returnObj;
        }

        private static void GetOutline(Line line, List<Line> OutputLines, ProcessedFile pf)
        {
            
            var statement = line as OpenBraceStatement;
            if (statement == null)
            {
                if (line.IsReference())
                {
                    var refStatement = line.ToReferenceStatement();
                    pf.References[refStatement.Reference] = refStatement;
                    OutputLines.Add(refStatement);
                }
                else
                {
                    OutputLines.Add(line);
                }
                return;
            }
            bool recurse = true;
            if (statement.IsInterface())
            {
                var interfaceStatement = statement.ToInterface();
                pf.Interfaces[interfaceStatement.Name] = interfaceStatement;
                statement = interfaceStatement;
                recurse = false;
            }
            else if (statement.IsFunction())
            {
                var functionStatement = statement.ToFunction();
                pf.Functions[functionStatement.FullName] = statement.ToFunction(); 
            }
            else if (statement.IsClass())
            {
                var classStatement = statement.ToClass();
                pf.Classes[classStatement.Name] = classStatement;
                statement = classStatement;
            }
            else if (statement.IsModule())
            {
                var moduleStatement = statement.ToModule();
                pf.Modules[moduleStatement.FullName] = moduleStatement;
                statement = moduleStatement;
            }
            
            OutputLines.Add(statement);
            if (statement.Children != null && recurse)
            {
                var newc = new List<Line>();
                foreach (var childLine in statement.Children)
                {
                    GetOutline(childLine, newc, pf);
                }
                statement.Children = newc;
            }
        }

    }
#endif
}
