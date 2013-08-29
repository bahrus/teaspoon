
using System.Runtime.CompilerServices;
namespace CurlyBraceParser
{
    //public interface ICanBePublicStatement  
    //{
    //    bool Public { get; set; }
    //}

    public static class CanBePublicStatementCode
    {
        // provided methods go here, as extension methods to MNamed

        // to maintain state:
        private class State
        {
            // public fields or properties for the desired state
            public string StatementWithoutPublicKeyWord;
            public bool? IsPublic;
        }
        //private static readonly ConditionalWeakTable<LiveStatement, State>
        //  _stateTable = new ConditionalWeakTable<LiveStatement, State>();

        // to access the state:
        public static string GetStatementWithoutPublicKeyWord(this ILiveStatement self)
        {
            //return _stateTable.GetOrCreateValue(self as LiveStatement).StatementWithoutPublicKeyWord;
            if (self.FrontTrimmedLiveStatement.StartsWith(TypeStrictInterpreter.PublicKeyword))
            {

                string start = self.FrontTrimmedLiveStatement.Substring(TypeStrictInterpreter.PublicKeyword.Length).TrimStart();
                return start;
                //self.SetStatementWithoutPublicKeyWord(start);
                //self.SetStatementIsPublic(true);
            }
            else
            {
                return self.FrontTrimmedLiveStatement;
                //self.SetStatementIsPublic(false);
            }
        }
        //public static void SetStatementWithoutPublicKeyWord(this ILiveStatement self, string value)
        //{
        //    _stateTable.GetOrCreateValue(self as LiveStatement).StatementWithoutPublicKeyWord = value;
        //}

        public static bool GetStatementIsPublic(this ILiveStatement self)
        {
            //var ls = self as ILiveStatement;
            //var statement = self as Statement;
            if (self == null || string.IsNullOrEmpty(self.Statement)) return false;
            //if (_stateTable.GetOrCreateValue(self as LiveStatement).IsPublic == null)
            {
                if (self.FrontTrimmedLiveStatement.StartsWith(TypeStrictInterpreter.PublicKeyword))
                {

                    string start = self.FrontTrimmedLiveStatement.Substring(TypeStrictInterpreter.PublicKeyword.Length).TrimStart();
                    return true;
                    //self.SetStatementWithoutPublicKeyWord(start);
                    //self.SetStatementIsPublic(true);
                }
                else
                {
                    return false;
                    //self.SetStatementIsPublic(false);
                }
            }
            //return (bool)_stateTable.GetOrCreateValue(self as LiveStatement).IsPublic;
        }

        //public static void SetStatementIsPublic(this ILiveStatement self, bool value)
        //{
        //    _stateTable.GetOrCreateValue(self as LiveStatement).IsPublic = value;
        //}
    }
}
