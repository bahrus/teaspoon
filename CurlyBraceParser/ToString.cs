using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CurlyBraceParser
{
    public partial class LiveStatement{public override string ToString(){ return this.FrontTrimmedLiveStatement;}}

    public partial class OpenBraceStatement { public override string ToString() { return this.LiveStatementBase.FrontTrimmedLiveStatement; } }

    public partial class Field { public override string ToString() { return this.Name; } } 
}
