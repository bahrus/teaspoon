using System.Linq;
using System.Collections.Generic;
using System.Text;
namespace CurlyBraceParser
{
    public static class StringEx
    {

        public static string SubstringAfter(this string value, string search)
        {
            if (value == null) return null;
            int posOfSearch = value.IndexOf(search);
            if (posOfSearch == -1) return string.Empty;
            return value.Substring(posOfSearch + search.Length);
        }

        public static string SubstringAfterLast(this string value, string search)
        {
            if (value == null) return null;
            int iPos = value.LastIndexOf(search);
            if (iPos == -1) return string.Empty;
            return value.Substring(iPos + search.Length);
        }

        public static string SubstringBefore(this string value, string search)
        {
            if (value == null) return null;
            int iPos = value.IndexOf(search);
            if (iPos == -1) return value;
            return value.Substring(0, iPos);
        }

        public static string SubstringBeforeLast(this string value, string search)
        {
            if (value == null) return null;
            int iPos = value.LastIndexOf(search);
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

        /// <summary>
        /// Splits the string passed in by the delimiters passed in.
        /// Quoted sections are not split, and all tokens have whitespace
        /// trimmed from the start and end.
        public static List<string> SplitOutsideQuotesAndTrim(this string stringToSplit, params char[] delimiters)
        {
            List<string> results = new List<string>();

            bool inQuote = false;
            StringBuilder currentToken = new StringBuilder();
            for (int index = 0; index < stringToSplit.Length; ++index)
            {
                char currentCharacter = stringToSplit[index];
                if (currentCharacter == '"')
                {
                    // When we see a ", we need to decide whether we are
                    // at the start or send of a quoted section...
                    inQuote = !inQuote;
                }
                else if (delimiters.Contains(currentCharacter) && inQuote == false)
                {
                    // We've come to the end of a token, so we find the token,
                    // trim it and add it to the collection of results...
                    string result = currentToken.ToString().Trim();
                    if (result != "") results.Add(result);

                    // We start a new token...
                    currentToken = new StringBuilder();
                }
                else
                {
                    // We've got a 'normal' character, so we add it to
                    // the curent token...
                    currentToken.Append(currentCharacter);
                }
            }

            // We've come to the end of the string, so we add the last token...
            string lastResult = currentToken.ToString().Trim();
            if (lastResult != "") results.Add(lastResult);

            return results;
        }

        public static List<string> SplitOutsideGroupings(this string stringToSplit, char[] openGroupChars, char[] closedGroupChars, params char[] delimiters)
        {
            if(stringToSplit==null) return null;
            //int ithChar = 0;
            int len = stringToSplit.Length;
            int openGroupCount = 0;
            List<string> returnObj = new List<string>();
            StringBuilder sb = new StringBuilder();
            for (int ithChar = 0; ithChar < len; ithChar++)
            {
                char c = stringToSplit[ithChar];
                if (delimiters.Contains(c) && openGroupCount == 0)
                {
                    returnObj.Add(sb.ToString());
                    sb = new StringBuilder();
                    continue;
                }
                sb.Append(c);
                if (openGroupChars.Contains(c))
                {
                    openGroupCount++;
                }
                else if (closedGroupChars.Contains(c))
                {
                    openGroupCount--;
                }
            }
            returnObj.Add(sb.ToString());
            return returnObj;
        }

        public static List<string> SplitOutsideGroupings(this string stringToSplit, char[] openGroupChars, char[] closedGroupChars, string delimiter)
        {
            if (stringToSplit == null) return null;
            //int ithChar = 0;
            int len = stringToSplit.Length;
            int openGroupCount = 0;
            List<string> returnObj = new List<string>();
            StringBuilder sb = new StringBuilder();
            for (int ithChar = 0; ithChar < len; ithChar++)
            {
                char c = stringToSplit[ithChar];
                sb.Append(c);
                //if (delimiters.Contains(c) && openGroupCount == 0)
                if(sb.ToString().EndsWith(delimiter) && openGroupCount ==0) //TODO:  Improve performance, this grows as n squared maybe
                {
                    returnObj.Add(sb.ToString().SubstringBeforeLast(delimiter));
                    sb = new StringBuilder();
                    continue;
                }
                
                if (openGroupChars.Contains(c))
                {
                    openGroupCount++;
                }
                else if (closedGroupChars.Contains(c))
                {
                    openGroupCount--;
                }
            }
            returnObj.Add(sb.ToString());
            return returnObj;
        }

        public static CharSearchResult FindChars(this string stringToSearch, params char[] searchCars)
        {
            if (stringToSearch == null) return null;
            var len = stringToSearch.Length;
            for (int i = 0; i < len; i++)
            {
                var c = stringToSearch[i];
                if (searchCars.Contains(c))
                {
                    return new CharSearchResult
                    {
                        CharFound = c,
                        PosFound = i,
                        StringBeforeChar = stringToSearch.Substring(0, i),
                    };
                }
            }
            return null;
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
            return And(endsWith, false);
        }

        public string AndLast(string endsWith)
        {
            return And(endsWith, true);
        }

        private string And(string endsWith, bool last)
        {
            this.EndsWith = endsWith;
            if (StringBeingSearched == null) return null;
            string StringBeingSearchedLC = this._CaseSensitive ? StringBeingSearched.ToLower() : StringBeingSearched;
            string StartsWithLC = this._CaseSensitive ? StartsWith.ToLower() : StartsWith;
            string EndsWithLC = this._CaseSensitive ? EndsWith.ToLower() : EndsWith;
            iPosOfStart = StringBeingSearchedLC.IndexOf(StartsWithLC);
            if (iPosOfStart == -1) return string.Empty;
            if (!_Inclusive) iPosOfStart += StartsWithLC.Length;
            iPosOfEnd = last ? StringBeingSearchedLC.LastIndexOf(EndsWithLC) : StringBeingSearchedLC.IndexOf(EndsWithLC, iPosOfStart);
            if (iPosOfEnd == -1) return StringBeingSearched.Substring(iPosOfStart);
            if (iPosOfEnd < iPosOfStart) return StringBeingSearched.Substring(iPosOfStart);
            if (_Inclusive) iPosOfEnd += EndsWith.Length;
            return StringBeingSearched.Substring(iPosOfStart, iPosOfEnd - iPosOfStart );
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

    public class CharSearchResult
    {
        public char CharFound;
        public int PosFound;
        public string StringBeforeChar;
    }
}
