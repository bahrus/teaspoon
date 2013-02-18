
using System.Runtime.CompilerServices;
namespace CurlyBraceParser
{
    public interface ICanBePublicStatement  
    {
        bool Public { get; set; }
    }

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
        public static string GetStatementWithoutPublicKeyWord(this Statement self)
        {
            return _stateTable.GetOrCreateValue(self).StatementWithoutPublicKeyWord;
        }
        public static void SetStatementWithoutPublicKeyWord(this Statement self, string value)
        {
            _stateTable.GetOrCreateValue(self).StatementWithoutPublicKeyWord = value;
        }

        public static bool GetStatementIsPublic(this Statement self)
        {
            if (self == null || string.IsNullOrEmpty(self.LiveStatement)) return false;
            if (_stateTable.GetOrCreateValue(self).IsPublic == null)
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
            return (bool)_stateTable.GetOrCreateValue(self).IsPublic;
        }

        public static void SetStatementIsPublic(this Statement self, bool value)
        {
            _stateTable.GetOrCreateValue(self).IsPublic = value;
        }
    }
}
