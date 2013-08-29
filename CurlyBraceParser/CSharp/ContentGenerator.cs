using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

using ClassGenMacros;

namespace CurlyBraceParser.CSharp
{
    public static class ContentGenerator
    {
        public static string GetContent(this ILine line)
        {
            return "//" + line.Comment;
        }

        public static string GetContent(this ILiveStatement liveStatement)
        {
            return liveStatement.Statement + (string.IsNullOrEmpty(liveStatement.Comment) ? string.Empty : " //" + liveStatement.Comment);
        }

        public static string GetContent(this IOpenStatement openStatement)
        {
            var liveStatement = openStatement as ILiveStatement;
            var sw = new StringWriter();
            sw.WriteLine(liveStatement.GetContent());
            foreach (var child in openStatement.Children)
            {
                child.IfType<IOpenStatement>(os=> sw.WriteLine(os.GetContent()))
                    .ElseIfType<ILiveStatement>(ls => sw.WriteLine(ls.GetContent()))
                    .ElseIfType<ILine>(li => sw.WriteLine(li.GetContent()))
                ;
            }
            sw.WriteLine(openStatement.ClosingLine + openStatement.OptionalLineSeparator + openStatement.ClosingLineComment);
            return sw.ToString();
        }
    }
}
