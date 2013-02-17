
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

        public static BetweenStringsSearch SubstringBetween(this string stringToSearch, string startsWith)
        {
            return new BetweenStringsSearch
            {
                StringBeingSearched = stringToSearch,
                StartsWith = startsWith,
            };
        }

        public static string GetRelativeFilePath(this string filePath, string relativePath)
        {
            var pathTokens = relativePath.Split('/');
            var filePathTokens = filePath.Split('\\');
            var filePathTokenStack = new Stack<string>();
            foreach (string filePathToken in filePathTokens)
            {
                filePathTokenStack.Push(filePathToken);
            }
            filePathTokenStack.Pop();
            foreach (string dirName in pathTokens)
            {
                if (dirName == "..")
                {
                    filePathTokenStack.Pop();
                }
                else
                {
                    filePathTokenStack.Push(dirName);
                }
            }
            var sl = new List<string>();
            while (filePathTokenStack.Count > 0)
            {
                sl.Add(filePathTokenStack.Pop());
            }
            sl.Reverse();
            string path = string.Join("\\", sl.ToArray());
            return path;
        }
    }

    public class BetweenStringsSearch
    {
        public string StartsWith;
        public string EndsWith;
        private bool _Inclusive = false;
        private bool _CaseSensitive = false;
        public string StringBeingSearched;

        public BetweenStringsSearch Inclusive()
        {
            this._Inclusive = true;
            return this;
        }

        public BetweenStringsSearch CaseSensitive()
        {
            this._CaseSensitive = true;
            return this;
        }

        private int iPosOfStart;
        private int iPosOfEnd;

        public string And(string endsWith)
        {
            this.EndsWith = endsWith;
            if (StringBeingSearched == null) return null;
            string StringBeingSearchedLC = this._CaseSensitive ? StringBeingSearched.ToLower() : StringBeingSearched;
            string StartsWithLC = this._CaseSensitive ? StartsWith.ToLower() : StartsWith;
            string EndsWithLC = this._CaseSensitive ? EndsWith.ToLower() : EndsWith;
            iPosOfStart = StringBeingSearchedLC.IndexOf(StartsWithLC);
            if (iPosOfStart == -1) return string.Empty;
            if (!_Inclusive) iPosOfStart += StartsWithLC.Length;
            iPosOfEnd = StringBeingSearchedLC.IndexOf(EndsWithLC, iPosOfStart);
            if (iPosOfEnd == -1) return StringBeingSearched.Substring(iPosOfStart);
            if (_Inclusive) iPosOfEnd += EndsWith.Length;
            return StringBeingSearched.Substring(iPosOfStart, iPosOfEnd - iPosOfStart);
        }


    }

    public class ReplaceString
    {
        public bool Last;
        public string StringToSearch;
        public string SearchString;
        public string With(string replacementString)
        {
            int posOfString = this.Last ? StringToSearch.LastIndexOf(SearchString) : StringToSearch.IndexOf(SearchString);
            if (posOfString == -1) return StringToSearch;
            return StringToSearch.Substring(0, posOfString) + replacementString + StringToSearch.Substring(posOfString + SearchString.Length);
        }
    }
}
