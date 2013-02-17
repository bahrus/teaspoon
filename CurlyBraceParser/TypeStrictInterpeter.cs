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
        #region References
        public const string referenceLink = "/<reference path=";
        public static bool IsReference(this Line line)
        {
            var statement = line as Statement;
            if (statement != null) return false;
            if (string.IsNullOrEmpty(line.Comment)) return false;
            return line.Comment.StartsWith(referenceLink);
        }

        public static ReferenceStatement ToReferenceStatement(this Line line)
        {
            string path = line.Comment.SubstringBetween(referenceLink).And("/>");
            if (string.IsNullOrEmpty(path)) throw new Exception("No Path found in " + line.Comment);
            path = path.Trim().Replace("\"", "").Replace("'", "");
            var refStatement = new ReferenceStatement
            {
                Reference = path,
            };
            return refStatement;
        }
        #endregion

        #region Module
        public const string ModuleKeyword = "module";
        public const string PublicKeyword = "export";
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

        #region Interface
        public const string InterfaceKeyword = "interface";

        public static bool IsInterface(this Statement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.LiveStatement)) return false;
            if (statement.FrontTrimmedLiveStatement.StartsWith(InterfaceKeyword))
            {
                return true;
            }
            if (statement.FrontTrimmedLiveStatement.StartsWith(PublicKeyword))
            {
                string start = statement.FrontTrimmedLiveStatement.Substring(PublicKeyword.Length);
                if (start.TrimStart().StartsWith(InterfaceKeyword)) return true;
            }
            return false;
        }



        public static InterfaceStatement ToInterface(this OpenBraceStatement statement)
        {
            string first = statement.FrontTrimmedLiveStatement.SubstringBefore(' ', '{');
            bool isPublic = false;
            string name = null;
            if (first == PublicKeyword)
            {
                isPublic = true;
                name = statement.FrontTrimmedLiveStatement.Substring(PublicKeyword.Length).TrimStart();
                name = name.Substring(InterfaceKeyword.Length).TrimStart();
                name = name.SubstringBefore(' ', '{');
            }
            if (string.IsNullOrEmpty(name))
            {
            }
            var interfaceSt = new InterfaceStatement
            {
                Name                            = name,
                Public                          = isPublic,
                Children                        = statement.Children,
                ClosingLine                     = statement.ClosingLine,
                ClosingLineComment              = statement.ClosingLineComment,
                Comment                         = statement.Comment,
                IncludeNextLine                 = statement.IncludeNextLine,
                LineNumber                      = statement.LineNumber,
                LiveStatement                   = statement.LiveStatement,
                OptionalLineSeparator           = statement.OptionalLineSeparator,
                Parent                          = statement.Parent,
            };
            return interfaceSt;
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
