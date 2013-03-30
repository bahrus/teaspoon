using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser.CSharp
{
    public static class ListEx
    {
        public static List<T> MoveItem<T>(this List<T> list, int From, int To)
        {
            T item = list[From];
            list.RemoveAt(From);
            int ToAdjusted = To < From ? To : To - 1;
            list.Insert(To, item);
            return list;
        }
    }
}
