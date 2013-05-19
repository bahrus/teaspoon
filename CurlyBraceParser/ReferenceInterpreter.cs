using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClassGenMacros;

namespace CurlyBraceParser
{
    

    #if TypeStrict
    public static class ReferenceInterpreter
    {
        #region References
        public const string referenceLink = "/<reference path=";
        public static bool IsReference(this ILine line)
        {
            var statement = line as ILiveStatement;
            if (statement != null) return false;
            if (string.IsNullOrEmpty(line.Comment)) return false;
            return line.Comment.StartsWith(referenceLink);
        }

        public static ReferenceStatement ToReferenceStatement(this Line line)
        {
            string path = line.Comment.SubstringBetween(referenceLink).And("/>");
            if (string.IsNullOrEmpty(path)) throw new Exception("No Path found in " + line.Comment);
            path = path.Trim().Replace("\"", "").Replace("'", "");
            var refStatement = new ReferenceStatement(Line: line)
            {
                ClientSideReference = path,
            };
            return refStatement;
        }
        #endregion

        
    }

    
    #endif
}
