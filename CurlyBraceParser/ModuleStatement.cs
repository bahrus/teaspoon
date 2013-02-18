﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
    public class ModuleStatement : OpenBraceStatement
    {
        public string FullName { get; set; }
    }

#if TypeStrict
    public static class ModuleInterpreter
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
                Children = statement.Children,
                ClosingLine = statement.ClosingLine,
                ClosingLineComment = statement.ClosingLineComment,
                Comment = statement.Comment,
                FullName = moduleName,
                IncludeNextLine = statement.IncludeNextLine,
                LineNumber = statement.LineNumber,
                LiveStatement = statement.LiveStatement,
                OptionalLineSeparator = statement.OptionalLineSeparator,
                Parent = statement.Parent,
            };
            return ms;
        }
        #endregion
    }
#endif
}
