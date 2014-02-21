using System;
using System.Text.RegularExpressions;

namespace tspHandler
{
    static public class CssSelectorHelper
    {
        public static int CalculateSpecificity(string selector)
        {
            return CalculateSpecificity(selector,
                // Concatenating the four numbers a-b-c-d (in a number 
                // system with a large base) gives the specificity.
                (a, b, c, d) => int.Parse(string.Concat(a, b, c, d)));
        }

        /// <remarks>
        /// See <a href="http://www.w3.org/TR/CSS2/cascade.html#specificity">6.4.3 
        /// Calculating a selector's specificity</a> for more information
        /// </remarks>

        public static T CalculateSpecificity<T>(string selector, Func<int, int, int, int, T> resultor)
        {
            if (selector == null) throw new ArgumentNullException("selector");
            if (resultor == null) throw new ArgumentNullException("resultor");

            // Ported from http://ruby-css-parser.googlecode.com/svn/trunk/lib/css_parser.rb
            // Patterns for specificity calculations:
            // http://ruby-css-parser.googlecode.com/svn/trunk/lib/css_parser/regexps.rb

            return resultor(
                /* a */ 0,
                /* b */ RegexOccurrences(selector, @"\#"),
                /* c */ RegexOccurrences(selector, @"(\.[\w]+)|(\[[\w]+)|(\:(link|first\-child|lang))"),
                /* d */ RegexOccurrences(selector, @"((^|[\s\+\>]+)[\w]+|\:(first\-line|first\-letter|before|after))"));
        }

        private static int RegexOccurrences(string input, string pattern)
        {
            const RegexOptions options = RegexOptions.IgnoreCase
                                         | RegexOptions.CultureInvariant
                                         | RegexOptions.IgnorePatternWhitespace;
            return Regex.Matches(input, pattern, options).Count;
        }
    }
}
