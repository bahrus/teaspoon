using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
    public static class TypeMatch
    {
        public static object IfType<T>(this object Obj, Action<T> Do) where T: class
        {
            if (Obj == null) return null;
            var objT = Obj as T;
            if (objT == null)
            {
                return Obj;
            }
            Do(objT);
            return null;
        }

        public static object ElseIfType<T>(this object Obj, Action<T> Do) where T : class
        {
            if (Obj == null) return null; //avoid extra function call
            return IfType<T>(Obj, Do);
        }
    }
}
