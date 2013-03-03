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
                            line.IfType<Statement>(s => TranspileInterfaceStatement(s));
                            //TranspileInterfaceStatement(line);
                        }
                    }
                }
            }
        }

        private static void TranspileInterfaceStatement(Statement st)
        {
            var ls = st.LiveStatement.Trim();
            if (string.IsNullOrEmpty(ls)) return;
            //if (!ls.Contains(':')) return;
            var search = ls.FindChars(':', '(', ';');
            if (search == null)
            {
                throw new Exception("??"); //TODO
            }
            string MemberName = search.StringBeforeChar.Trim().SubstringBefore("?");
            
            switch (search.CharFound)
            {
                case ':':
                    //string MemberName = ls.SubstringBefore(":").Trim().SubstringBefore("?");
                    //string TypeInfo = ls.SubstringAfter(":").Trim().TrimEnd(';');
                    string Specification = ls.Substring(search.PosFound + 1).Trim().TrimEnd(';');
                    var tst = TypeStrictType.ParseFieldType(Specification);
                    Block.AppendStatement(tst.CSharpTypeString + " " + MemberName);
                    break;
                case ';':
                    Block.AppendStatement("object " + MemberName);
                    break;
                case '(':
                    string Signature = ls.Substring(search.PosFound).Trim().TrimEnd(';');
                    var argsPlusReturn = Signature.SplitOutsideGroupings(Parser.OpenChars, Parser.ClosedChars, ':');
                    string returnType = "object";
                    string unparsedArgs = null;

                    if (argsPlusReturn.Count == 2)
                    {
                        var ret = TypeStrictType.ParseFieldType(argsPlusReturn[1].Trim());
                        returnType = ret.CSharpTypeString;
                    }
                    string args = argsPlusReturn[0].SubstringBetween("(").AndLast(")");
                    var argArr = args.SplitOutsideGroupings(Parser.OpenChars, Parser.ClosedChars, ',');
                    var tsArgs = new Dictionary<string, TypeStrictType>();
                    argArr.ForEach(s =>
                    {
                        var sWithoutName = s.SubstringAfter(":");
                        var sName = s.SubstringBefore(":");
                        tsArgs[sName] = TypeStrictType.ParseFieldType(sWithoutName);
                    });
                    var sbMethod = new StringBuilder();
                    sbMethod.Append(returnType + " " + MemberName + "(");
                    var argsL = new List<string>();
                    foreach (var kvp in tsArgs)
                    {
                        //sbMethod.Append(kvp.Value.CSharpTypeString + " "
                        argsL.Add(kvp.Value.CSharpTypeString + " " + kvp.Key);
                    }
                    sbMethod.Append(string.Join(", ", argsL.ToArray()));
                    sbMethod.Append(")");
                    Block.AppendStatement(sbMethod.ToString());
                    break;
            }
            
        }

        

    }

    public abstract class TypeStrictType
    {


        public static TypeStrictType ParseFieldType(string type)
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
                    ValueType = ParseFieldType(ValType),
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
                    canonicalType.SplitOutsideGroupings(Parser.OpenChars, Parser.ClosedChars, ':')
                    :
                    canonicalType.SplitOutsideGroupings(Parser.OpenChars, Parser.ClosedChars, "=>")
                ;
                if (splitBySemiColon.Count != 2)
                {
                    throw new Exception("??");
                }
                var Args = splitBySemiColon.ElementAt(0);
                var RetArg = splitBySemiColon.ElementAt(1);
                if (DictionaryFunctionLookup)
                {
                    RetArg = RetArg.SubstringBeforeLast(";");
                }
                Args = Args.SubstringBetween("(").AndLast(")");
                Args = Args.Substring(0, Args.Length - 1);
                var splitArgs = Args.SplitOutsideGroupings(Parser.OpenChars, Parser.ClosedChars, ',');
                var tsArgs = new List<TypeStrictType>();
                splitArgs.ForEach(s => {
                    var sWithoutName = s.SubstringAfter(":");
                    //if (DictionaryFunctionLookup)
                    //{
                    //    sWithoutName = sWithoutName.SubstringBeforeLast(";");
                    //}
                    tsArgs.Add(TypeStrictType.ParseFieldType(sWithoutName));
                });
                returnObj = new FuncTypeStrictType
                {
                    Args = tsArgs,
                    ReturnType = TypeStrictType.ParseFieldType(RetArg),
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

        private static Dictionary<string, string> TypeTransations = new Dictionary<string, string>
        {
            {"any", "object"},
        };

        public override string CSharpTypeString
        {
            get { 
                return TypeTransations.ContainsKey(StrictTypeName) ? TypeTransations[StrictTypeName] : StrictTypeName; 
            }
        }
    }

    
}
