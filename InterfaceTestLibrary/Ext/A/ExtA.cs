using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace InterfaceTestLibrary.Ext.A
{
    public static class ExtA
    {
        private static ExtensionLib ExtensionLib;
        static ExtA()
        {
            ExtensionLib = new ExtensionLib();
        }
        public static void DoA(this LibA.InterfaceA iA)
        {
            if (iA == null) return;
            ExtensionLib.DoA(iA);
        }

        public static void DoB(this LibA.InterfaceA iA)
        {
        }

        public static void DoC(this LibA.InterfaceA iA)
        {
        }

        public static Expression<Action<LibA.InterfaceA>> eA = ia => ia.DoA();
        public static Expression<Action<LibA.InterfaceA>> eB = ia => ia.DoB();
        public static Expression<Action<LibA.InterfaceA>> eC = ia => ia.DoC();

        public static List<Expression> Inherit1 = new List<Expression>{
            eA, eB
        };

        

    }

    [GeneratedCodeAttribute("tsp", "1")]
    public class ExtensionLib
    {
        public void DoA(LibA.InterfaceA iA)
        {
        }
    }
}
