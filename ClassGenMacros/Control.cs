using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
//using System.Threading.Tasks;

namespace ClassGenMacros
{
    public static class Control
    {
        public static bool DoBeforeAndAfterIfTrue(this bool Test, Action Before, Action After, Action DoAlways)
        {
            if (Test) Before();
            DoAlways();
            if (Test) After();
            return Test;
        }
    }

    public class Block : IDisposable
    {
        [ThreadStatic]
        private static StringBuilder _sb;

        [ThreadStatic]
        private static int _level;

        private string _OpenBlockText;

        public static void IncrementLevel()
        {
            _level++;
        }

        public static void DecrementLevel()
        {
            _level--;
        }

        public Block(string Text)
        {
            if (string.IsNullOrEmpty(Text)) return;
            if (_sb == null) _sb = new StringBuilder();
            Block.AppendTabs();
            _sb.AppendLine(Text + "{");
            _level++;
            this._OpenBlockText = Text;
        }

        private static void AppendTabs()
        {
            for (int i = 0; i < _level; i++)
            {
                _sb.Append("\t");
            }
        }

        public void Dispose()
        {
            if (_sb == null) return;
            if (string.IsNullOrEmpty(_OpenBlockText)) return;
            _level--;
            Block.AppendTabs();
            _sb.AppendLine("}");
        }

        public override string ToString()
        {
            if (_sb == null) return "???";
            return _sb.ToString();
        }

        public static string Text
        {
            get
            {
                if (_sb != null)
                {
                    string r = _sb.ToString();
                    _sb = null;
                    return r;
                }
                return null;
            }
        }

        public static void AppendClosingStatement(string Text)
        {
            if (_sb == null) _sb = new StringBuilder();
            Block.AppendTabs();
            _sb.AppendLine(Text);
        }

        public static void AppendStatement(string Text)
        {
            if (_sb == null) _sb = new StringBuilder();
            Block.AppendTabs();
            _sb.AppendLine(Text + ";");
        }

        public static void AppendBlankLine()
        {
            if (_sb == null) _sb = new StringBuilder();
            _sb.AppendLine(string.Empty);
        }

        public static void AppendBlock(string Text)
        {
            if (_sb == null) _sb = new StringBuilder();
            _sb.Append(Text);
        }
    }
}
