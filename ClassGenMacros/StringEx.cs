using System.Linq;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System;

namespace ClassGenMacros
{
    public static class StringEx
    {
        public static string ReadFile(this string FilePath)
        {
            if (FilePath == null) return null;
            if (!File.Exists(FilePath)) return null;
            return File.ReadAllText(FilePath);
        }

        public static string[] SplitFirst(this string value, string separator)
        {
            if (value == null) return null;
            int iPos = value.IndexOf(separator);
            if (iPos == -1) return new string[] { value };
            return new string[] { value.Substring(0, iPos), value.Substring(iPos + separator.Length) };
        }

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

        public static string RelativeTo(this string srcAbsFilePath, string referencedAbsFilePath)
        {
            return srcAbsFilePath.RelativeTo(referencedAbsFilePath, "/");
        }

        public static string RelativeTo(this string srcAbsFilePath, string referencedAbsFilePath, string returnPathSeparaor)
        {
            string srcAbsDirPath = srcAbsFilePath.SubstringBeforeLast("\\");
            string[] absDirs = srcAbsDirPath.Split('\\');
            string[] relDirs = referencedAbsFilePath.Split('\\');

            // Get the shortest of the two paths
            int len = Math.Min(absDirs.Length, relDirs.Length);

            // Use to determine where in the loop we exited
            int lastCommonRoot = -1;
            int index;

            // Find common root
            for (index = 0; index < len; index++)
            {
                if (absDirs[index] == relDirs[index]) lastCommonRoot = index;
                else break;
            }

            // If we didn't find a common prefix then throw
            if (lastCommonRoot == -1)
            {
                throw new ArgumentException("Paths do not have a common base");
            }

            // Build up the relative path
            StringBuilder relativePath = new StringBuilder();

            // Add on the ..
            for (index = lastCommonRoot + 1; index < absDirs.Length; index++)
            {
                if (absDirs[index].Length > 0) relativePath.Append(".." + returnPathSeparaor);
            }

            // Add on the folders
            for (index = lastCommonRoot + 1; index < relDirs.Length - 1; index++)
            {
                relativePath.Append(relDirs[index] + returnPathSeparaor);
            }
            relativePath.Append(relDirs[relDirs.Length - 1]);

            return relativePath.ToString();
        }


        //public static string GetRelativeFilePath(this string filePath, string relativePath)
        //{
        //    var pathTokens = relativePath.Split('/');
        //    var filePathTokens = filePath.Split('\\');
        //    var filePathTokenStack = new Stack<string>();
        //    foreach (string filePathToken in filePathTokens)
        //    {
        //        filePathTokenStack.Push(filePathToken);
        //    }
        //    filePathTokenStack.Pop();
        //    foreach (string dirName in pathTokens)
        //    {
        //        if (dirName == "..")
        //        {
        //            filePathTokenStack.Pop();
        //        }
        //        else
        //        {
        //            filePathTokenStack.Push(dirName);
        //        }
        //    }
        //    var sl = new List<string>();
        //    while (filePathTokenStack.Count > 0)
        //    {
        //        sl.Add(filePathTokenStack.Pop());
        //    }
        //    sl.Reverse();
        //    string path = string.Join("\\", sl.ToArray());
        //    return path;
        //}

        public static string NavigateTo(this string filePathOfWebResource, string relativeURL)
        {
            var pathTokens = relativeURL.Split('/');
            var filePathTokens = filePathOfWebResource.Split('\\');
            var filePathTokenStack = new Stack<string>();
            foreach (string filePathToken in filePathTokens)
            {
                filePathTokenStack.Push(filePathToken);
            }
            filePathTokenStack.Pop(); //directory of web resource
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
            return string.Join("\\", sl.ToArray());
        }

        public static string RemoveWhiteSpaceOutsideGroupings(this string stringToTrim, char[] openGroupChars, char[] closedGroupChars)
        {
            if (stringToTrim == null) return null;
            int openGroupCount = 0;
            List<Char> returnObj = new List<char>();
            for (int index = 0, len = stringToTrim.Length; index < len; index++)
            {
                var c = stringToTrim[index];
                if (openGroupChars.Contains(c))
                {
                    openGroupCount++;
                }
                else if(closedGroupChars.Contains(c))
                {
                    openGroupCount--;
                }
                if (openGroupCount == 0)
                {
                    if (!Char.IsWhiteSpace(c))
                    {
                        returnObj.Add(c);
                    }
                }
                else
                {
                    returnObj.Add(c);
                }
            }
            return new string(returnObj.ToArray());
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
                    // When we see assemblies ", we need to decide whether we are
                    // at the start or send of assemblies quoted section...
                    inQuote = !inQuote;
                }
                else if (delimiters.Contains(currentCharacter) && inQuote == false)
                {
                    // We've come to the end of assemblies token, so we find the token,
                    // trim it and add it to the collection of results...
                    string result = currentToken.ToString().Trim();
                    if (result != "") results.Add(result);

                    // We start assemblies new token...
                    currentToken = new StringBuilder();
                }
                else
                {
                    // We've got assemblies 'normal' character, so we add it to
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
