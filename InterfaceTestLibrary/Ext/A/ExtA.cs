using CurlyBraceParser.CSharp;
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

    [AutoGenerateExtensionMethodsFromType]
    public class ExtensionLib
    {
        public void DoA(LibA.InterfaceA iA)
        {
        }
    }
}
