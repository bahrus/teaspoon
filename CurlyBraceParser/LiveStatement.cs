using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using ClassGenMacros;

namespace CurlyBraceParser
{
    partial class LiveStatement
    {
        private string _FrontTrimmedLiveStatement;
        public string FrontTrimmedLiveStatement
        {
            get
            {
                if (_FrontTrimmedLiveStatement == null)
                {
                    _FrontTrimmedLiveStatement = this.Statement.TrimStart();
                }
                return _FrontTrimmedLiveStatement;
            }
        }
    }
}
