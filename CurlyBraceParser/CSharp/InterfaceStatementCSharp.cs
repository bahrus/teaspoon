using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser.CSharp
{
    public static class InterfaceStatementCSharp
    {
        public static void Content(this List<InterfaceStatement> Interfaces)
        {
            if (Interfaces == null) return;
            foreach (var IF in Interfaces)
            {
                string InterfaceDeclaration = (IF.Public ? "public " : "") + "interface " + IF.Name;
                using (new Block(InterfaceDeclaration))
                {
                    if (IF.Children != null)
                    {
                        foreach (var line in IF.Children)
                        {
                            TranspileInterfaceLine(line);
                        }
                    }
                }
            }
        }

        private static void TranspileInterfaceLine(Line line)
        {
            if (string.IsNullOrEmpty(line.Content)) return;
            if (!line.Content.Contains(':')) return;
            string MemberName = line.Content.SubstringBefore(":").Trim().SubstringBefore("?");
            string TypeInfo = line.Content.SubstringAfter(":").Trim().TrimEnd(';');
            var tst = TypeStrictType.Parse(TypeInfo);
            Block.AppendStatement(tst.CSharpTypeString + " " + MemberName);
        }

    }

    public abstract class TypeStrictType
    {


        public static TypeStrictType Parse(string type)
        {
            string canonicalType = type.Replace(" ", "");
            TypeStrictType returnObj = null;
            if (canonicalType.StartsWith("{["))
            {
                //string key = canonicalType.SubstringBefore(":");
                //key = key.SubstringAfter("[");
                string ValType = canonicalType.SubstringAfter("]:");
                ValType = ValType.SubstringBeforeLast(";}");
 
                returnObj = new AssociativeArrayTypeStrictType
                {
                    ValueType = Parse(ValType),
                };
                return returnObj;
            }
            else if (canonicalType.StartsWith("(") || canonicalType.StartsWith("{("))
            {
                bool DictionaryFunctionLookup = false;
                if(canonicalType.StartsWith("{(")){
                    DictionaryFunctionLookup = true;
                    canonicalType = canonicalType.SubstringBetween("{").AndLast("}");
                }
                var splitBySemiColon = DictionaryFunctionLookup ?
                    canonicalType.SplitOutsideGroupings(new char[] { '(', '{', '[', '<' }, new char[] { ')', '}', ']', '>' }, ':')
                    :
                    canonicalType.SplitOutsideGroupings(new char[] { '(', '{', '[', '<' }, new char[] { ')', '}', ']', '>' }, "=>")
                ;
                if (splitBySemiColon.Count != 2)
                {
                    throw new Exception("??");
                }
                var Args = splitBySemiColon.ElementAt(0);
                var RetArg = splitBySemiColon.ElementAt(1);
                Args = Args.SubstringBetween("(").AndLast(")");
                Args = Args.Substring(0, Args.Length - 1);
                var splitArgs = Args.SplitOutsideGroupings(new char[] { '(', '{', '[', '<' }, new char[] { ')', '}', ']', '>' }, ',');
                var tsArgs = new List<TypeStrictType>();
                splitArgs.ForEach(s => {
                    var sWithoutName = s.SubstringAfter(":");
                    if (DictionaryFunctionLookup)
                    {
                        sWithoutName = sWithoutName.SubstringBeforeLast(";");
                    }
                    tsArgs.Add(TypeStrictType.Parse(sWithoutName));
                });
                returnObj = new FuncTypeStrictType
                {
                    Args = tsArgs,
                    ReturnType = TypeStrictType.Parse(RetArg),
                };
            }
            else
            {
                returnObj = new SimpleStrictType
                {
                    StrictTypeName = type,
                };
            }
            return returnObj;
        }

        private static int PosOfFirstSemiColonOutsideParenthesis(string text)
        {
            int parenCount = 1;
            int ithChar = 1;
            int len = text.Length;
            while (ithChar < len)
            {
                char c = text[ithChar];
                switch (c)
                {
                    case '(':
                        parenCount++;
                        break;
                    case ')':
                        parenCount--;
                        break;
                    case ':':
                        if (parenCount == 0) return ithChar;
                        break;
                }
                ithChar++;
            }
            return ithChar;
        }

        public abstract string CSharpTypeString { get; }
        
    }

    public class AssociativeArrayTypeStrictType : TypeStrictType
    {
        //public string LookupKey { get; set; }

        public TypeStrictType ValueType { get; set; }

        public override string CSharpTypeString
        {
            get { return "Dictionary<string, " + ValueType.CSharpTypeString + ">"; }
        }
    }

    public class FuncTypeStrictType : TypeStrictType
    {
        public List<TypeStrictType> Args { get; set; }
        public TypeStrictType ReturnType { get; set; }

        public override string CSharpTypeString
        {
            get { 
                var list = new List<string>();
                foreach(var type in this.Args){
                    list.Add(type.CSharpTypeString);
                }
                return "Func<" + string.Join(",", list.ToArray()) + "," + ReturnType.CSharpTypeString + ">"; 
            }
        }
    }

    public class SimpleStrictType : TypeStrictType
    {
        public string StrictTypeName { get; set; }

        public override string CSharpTypeString
        {
            get { return StrictTypeName; }
        }
    }

    
}
