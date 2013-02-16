using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
#if TypeStrict
    public class VariableOpenBraceStatement : OpenBraceStatement
    {
    }

    public class VariableOpenParenOpenBraceStatement : OpenParenOpenBraceStatement
    {
    }

    public class VariableStatement : Statement
    {
    }
#endif
}
