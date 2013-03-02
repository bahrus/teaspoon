using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
    public class ModuleStatement : OpenBraceStatement
    {
        public string FullName { get; set; }

        //public override void ToCSharp(StringBuilder sb)
        //{
        //    if (this.FullName.Contains("."))
        //    {
        //    }
        //}
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
                FullName = moduleName,
            };
            statement.CopyOpenStatementTo(ms);
            return ms;
        }
        #endregion
    }
#endif
}
