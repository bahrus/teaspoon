using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace tspHandler
{
    public static class StringEx
    {
        

        //public static FileInfo GetFileInfo(this string FilePath)
        //{
        //    if (FilePath == null) return null;
        //    return new FileInfo(FilePath);
        //}

        //public static BetweenStringsSearch SubstringBetween(this string stringToSearch, string startsWith)
        //{
        //    return new BetweenStringsSearch
        //    {
        //        StringBeingSearched = stringToSearch,
        //        StartsWith = startsWith,
        //    };
        //}

        //public static ReplaceString ReplaceLast(this string stringToSearch, string searchString)
        //{
        //    return new ReplaceString
        //    {
        //        Last = true,
        //        StringToSearch = stringToSearch,
        //        SearchString = searchString,
        //    };
        //}

        /// <summary>
        /// From http://www.iandevlin.com/blog/2010/01/csharp/generating-a-relative-path-in-csharp
        /// </summary>
        /// <param name="srcAbsFilePath"></param>
        /// <param name="referencedAbsFilePath"></param>
        /// <returns></returns>
        
        

        //public static string SubstringAfter(this string stringToSearch, string searchString)
        //{
        //    if (stringToSearch == null) return null;
        //    int iPos = stringToSearch.IndexOf(searchString);
        //    if (iPos == -1) return string.Empty;
        //    return stringToSearch.Substring(iPos + 1);
        //}

        //public static string SubstringAfterLast(this string stringToSearch, string searchString)
        //{
        //    if (stringToSearch == null) return null;
        //    int iPos = stringToSearch.LastIndexOf(searchString);
        //    if (iPos == -1) return string.Empty;
        //    return stringToSearch.Substring(iPos + 1);
        //}

        //public static string SubstringBeforeLast(this string stringToSearch, string searchString)
        //{
        //    if (stringToSearch == null) return null;
        //    int iPos = stringToSearch.LastIndexOf(searchString);
        //    if (iPos == -1) return stringToSearch;
        //    return stringToSearch.Substring(0, iPos);
        //}
    }

    //public class BetweenStringsSearch
    //{
    //    public string StartsWith;
    //    public string EndsWith;
    //    private bool _Inclusive = false;
    //    private bool _CaseSensitive = false;
    //    public string StringBeingSearched;

    //    public BetweenStringsSearch Inclusive()
    //    {
    //        this._Inclusive = true;
    //        return this;
    //    }

    //    public BetweenStringsSearch CaseSensitive()
    //    {
    //        this._CaseSensitive = true;
    //        return this;
    //    }

    //    private int iPosOfStart;
    //    private int iPosOfEnd;

    //    public string And(string endsWith)
    //    {
    //        this.EndsWith = endsWith;
    //        if(StringBeingSearched==null) return null;
    //        string StringBeingSearchedLC = this._CaseSensitive ? StringBeingSearched.ToLower() : StringBeingSearched;
    //        string StartsWithLC = this._CaseSensitive ? StartsWith.ToLower() : StartsWith;
    //        string EndsWithLC = this._CaseSensitive ? EndsWith.ToLower() : EndsWith;
    //        iPosOfStart = StringBeingSearchedLC.IndexOf(StartsWithLC);
    //        if (iPosOfStart == -1) return string.Empty;
    //        if(!_Inclusive) iPosOfStart += StartsWithLC.Length;
    //        iPosOfEnd = StringBeingSearchedLC.IndexOf(EndsWithLC, iPosOfStart);
    //        if (iPosOfEnd == -1) return StringBeingSearched.Substring(iPosOfStart);
    //        if (_Inclusive) iPosOfEnd += EndsWith.Length;
    //        return StringBeingSearched.Substring(iPosOfStart, iPosOfEnd - iPosOfStart);
    //    }


    //}

    //public class ReplaceString
    //{
    //    public bool Last;
    //    public string StringToSearch;
    //    public string SearchString;
    //    public string With(string replacementString)
    //    {
    //        int posOfString = this.Last ? StringToSearch.LastIndexOf(SearchString) : StringToSearch.IndexOf(SearchString);
    //        if (posOfString == -1) return StringToSearch;
    //        return StringToSearch.Substring(0, posOfString) + replacementString + StringToSearch.Substring(posOfString + SearchString.Length);
    //    }
    //}
}
