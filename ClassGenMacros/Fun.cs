using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ClassGenMacros
{
    public static class Fun
    {
        public static Func<TResult> InferType<TResult>(Func<TResult> fun)
        {
            return fun;
        }

        public static Func<TSrc, TResult> InferType<TSrc, TResult>(Func<TSrc, TResult> fun)
        {
            return fun;
        }

        public static Func<TSrc1, TSrc2,  TResult> InferType<TSrc1, TSrc2, TResult>(Func<TSrc1, TSrc2, TResult> fun)
        {
            return fun;
        } 
    }
}
