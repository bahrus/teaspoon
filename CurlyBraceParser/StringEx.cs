
using System.Collections.Generic;
namespace CurlyBraceParser
{
    public static class StringEx
    {
        public static string SubstringBefore(this string value, string search)
        {
            if (value == null) return null;
            int iPos = value.IndexOf(search);
            if (iPos == -1) return value;
            return value.Substring(0, iPos);
        }

        public static string SubstringBefore(this string value, params char[] search)
        {
            if (value == null) return null;
            var len = value.Length;
            var lookup = new Dictionary<char, bool>();
            foreach (char c in search)
            {
                lookup[c] = true;
            }
            for (int i = 0; i < value.Length; i++)
            {
                var c = value[i];
                if (lookup.ContainsKey(c)) return value.Substring(0, i);
            }
            return value;
        }
    }
}
