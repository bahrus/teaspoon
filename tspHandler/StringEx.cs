﻿using System;
using System.IO;
using System.Text;

namespace tspHandler
{
    public static class StringEx
    {
        public static string ReadFile(this string FilePath)
        {
            if (FilePath == null) return null;
            if (!File.Exists(FilePath)) return null;
            return File.ReadAllText(FilePath);
        }

        public static FileInfo GetFileInfo(this string FilePath)
        {
            if (FilePath == null) return null;
            return new FileInfo(FilePath);
        }

        public static BetweenStringsSearch SubstringBetween(this string stringToSearch, string startsWith)
        {
            return new BetweenStringsSearch
            {
                StringBeingSearched = stringToSearch,
                StartsWith = startsWith,
            };
        }

        public static ReplaceString ReplaceLast(this string stringToSearch, string searchString)
        {
            return new ReplaceString
            {
                Last = true,
                StringToSearch = stringToSearch,
                SearchString = searchString,
            };
        }

        /// <summary>
        /// From http://www.iandevlin.com/blog/2010/01/csharp/generating-a-relative-path-in-csharp
        /// </summary>
        /// <param name="absPath"></param>
        /// <param name="relTo"></param>
        /// <returns></returns>
        public static string RelativeTo(this string absPath, string relTo)
        {
            string[] absDirs = absPath.Split('\\');
            string[] relDirs = relTo.Split('\\');
  
            // Get the shortest of the two paths
            int len = absDirs.Length < relDirs.Length ? absDirs.Length : 
            relDirs.Length;

            // Use to determine where in the loop we exited
            int lastCommonRoot = -1;
            int index;

            // Find common root
            for (index = 0; index < len; index++) {
            if (absDirs[index] == relDirs[index]) lastCommonRoot = index;
            else break;
            }

            // If we didn't find a common prefix then throw
            if (lastCommonRoot == -1) {
            throw new ArgumentException("Paths do not have a common base");
            }

            // Build up the relative path
            StringBuilder relativePath = new StringBuilder();

            // Add on the ..
            for (index = lastCommonRoot + 1; index < absDirs.Length; index++) {
            if (absDirs[index].Length > 0) relativePath.Append("..\\");
            }
  
            // Add on the folders
            for (index = lastCommonRoot + 1; index < relDirs.Length - 1; index++) {
            relativePath.Append(relDirs[index] + "\\");
            }
            relativePath.Append(relDirs[relDirs.Length - 1]);
  
            return relativePath.ToString();
        }

        public static string SubstringAfter(this string stringToSearch, string searchString)
        {
            if (stringToSearch == null) return null;
            int iPos = stringToSearch.IndexOf(searchString);
            if (iPos == -1) return string.Empty;
            return stringToSearch.Substring(iPos);
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
            if(StringBeingSearched==null) return null;
            string StringBeingSearchedLC = this._CaseSensitive ? StringBeingSearched.ToLower() : StringBeingSearched;
            string StartsWithLC = this._CaseSensitive ? StartsWith.ToLower() : StartsWith;
            string EndsWithLC = this._CaseSensitive ? EndsWith.ToLower() : EndsWith;
            iPosOfStart = StringBeingSearchedLC.IndexOf(StartsWithLC);
            if (iPosOfStart == -1) return string.Empty;
            if(!_Inclusive) iPosOfStart += StartsWithLC.Length;
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
