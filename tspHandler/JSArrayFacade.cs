using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace tspHandler
{
    


    public class JSArrayFacade<T> : List<T>
    {
        public int length
        {
            get
            {
                return this.Count;
            }
        }

        public static JSArrayFacade<T> FromArray(T[] arr)
        {
            var returnObj = new JSArrayFacade<T>();
            foreach (var el in arr)
            {
                returnObj.Add(el);
            }
            return returnObj;
        }
    }
}
