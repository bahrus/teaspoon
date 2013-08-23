using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClassGenMacros
{
    public class Union<A, B>
    {
        readonly A Item1;
        readonly B Item2;
        int tag;

        public Union(A item) { Item1 = item; tag = 0; }
        public Union(B item) { Item2 = item; tag = 1; }

        public T Match<T>(Func<A, T> f, Func<B, T> g)
        {
            switch (tag)
            {
                case 0: return f(Item1);
                case 1: return g(Item2);
                default: throw new Exception("Unrecognized tag value: " + tag);
            }
        }


    }

    public class Union<A, B, C>
    {
        readonly A Item1;
        readonly B Item2;
        readonly C Item3;
        int tag;

        public Union(A item) { Item1 = item; tag = 0; }
        public Union(B item) { Item2 = item; tag = 1; }
        public Union(C item) { Item3 = item; tag = 2; }

        public T Match<T>(Func<A, T> a, Func<B, T> b, Func<C, T> c)
        {
            switch (tag)
            {
                case 0: return a(Item1);
                case 1: return b(Item2);
                case 2: return c(Item3);
                default: throw new Exception("Unrecognized tag value: " + tag);
            }
        }

        public void Match(Action<A> a, Action<B> b, Action<C> c)
        {
            switch (tag)
            {
                case 0: a(Item1); break;
                case 1: b(Item2); break;
                case 2: c(Item3); break;
                default: throw new Exception("Unrecognized tag value: " + tag);
            }
        }
    }
}
