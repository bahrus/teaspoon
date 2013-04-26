
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
        private static readonly ConditionalWeakTable<Statement, State>
          _stateTable = new ConditionalWeakTable<Statement, State>();

        // to access the state:
        public static string GetStatementWithoutPublicKeyWord(this IHaveLiveStatement self)
        {
            return _stateTable.GetOrCreateValue(self as Statement).StatementWithoutPublicKeyWord;
        }
        public static void SetStatementWithoutPublicKeyWord(this IHaveLiveStatement self, string value)
        {
            _stateTable.GetOrCreateValue(self as Statement).StatementWithoutPublicKeyWord = value;
        }

        public static bool GetStatementIsPublic(this IHaveLiveStatement self)
        {
            //var ls = self as IHaveLiveStatement;
            //var statement = self as Statement;
            if (self == null || string.IsNullOrEmpty(self.LiveStatement)) return false;
            if (_stateTable.GetOrCreateValue(self as Statement).IsPublic == null)
            {
                if (self.FrontTrimmedLiveStatement.StartsWith(TypeStrictInterpreter.PublicKeyword))
                {

                    string start = self.FrontTrimmedLiveStatement.Substring(TypeStrictInterpreter.PublicKeyword.Length).TrimStart();
                    self.SetStatementWithoutPublicKeyWord(start);
                    self.SetStatementIsPublic(true);
                }
                else
                {
                    self.SetStatementIsPublic(false);
                }
            }
            return (bool)_stateTable.GetOrCreateValue(self as Statement).IsPublic;
        }

        public static void SetStatementIsPublic(this IHaveLiveStatement self, bool value)
        {
            _stateTable.GetOrCreateValue(self as Statement).IsPublic = value;
        }
    }
}
