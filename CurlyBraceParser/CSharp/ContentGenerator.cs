using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClassGenMacros;

namespace CurlyBraceParser.CSharp
{
    public static class ContentGenerator
    {
        public static string GetContent(this ILine line)
        {
            return "//" + line.Comment;
        }

        public static string GetContent(this IHaveLiveStatement liveStatement)
        {
            return liveStatement.LiveStatement + (string.IsNullOrEmpty(liveStatement.Comment) ? string.Empty : " //" + liveStatement.Comment);
        }

        public static string GetContent(this IOpenStatement openStatement)
        {
            var liveStatement = openStatement as IHaveLiveStatement;
            var sw = new StringWriter();
            sw.WriteLine(liveStatement.GetContent());
            foreach (var child in openStatement.Children)
            {
                child.IfType<IOpenStatement>(os=> sw.WriteLine(os.GetContent()))
                    .ElseIfType<IHaveLiveStatement>(ls => sw.WriteLine(ls.GetContent()))
                    .ElseIfType<ILine>(li => sw.WriteLine(li.GetContent()))
                ;
            }
            sw.WriteLine(openStatement.ClosingLine + openStatement.OptionalLineSeparator + openStatement.ClosingLineComment);
            return sw.ToString();
        }
    }
}
