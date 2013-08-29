using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;


namespace CurlyBraceParser
{


#if TypeStrict
    public static class ModuleInterpreter
    {
        #region Module
        public const string ModuleKeyword = "module";
        
        public static bool IsModule(this IOpenBraceStatement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.Statement)) return false;
            return statement.LiveStatementBase.FrontTrimmedLiveStatement.StartsWith(ModuleKeyword);
        }

        //public static ModuleStatement ToModule(this IOpenBraceStatement statement)
        //{
        //    string moduleName = statement.FrontTrimmedLiveStatement;
        //    moduleName = moduleName.Substring(ModuleKeyword.Length);
        //    moduleName = moduleName.TrimStart().SubstringBefore(' ', '{');
        //    var ms = new ModuleStatement
        //    {
        //        FullName = moduleName,
        //    };
        //    statement.CopyOpenStatementTo(ms);
        //    return ms;
        //}
        #endregion
    }
#endif
}
