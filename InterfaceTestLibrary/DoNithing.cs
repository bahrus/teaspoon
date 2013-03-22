using InterfaceTestLibrary.Ext.A;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InterfaceTestLibrary
{
    public class DoNothing
    {
        public void DoSomething(LibA.InterfaceA a)
        {
            a.ExtA = new ExtensionLib();
        }

        

    }
}
