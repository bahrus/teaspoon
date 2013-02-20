using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
    public class StaticFunctionStatement : OpenBraceStatement, ICanBePublicStatement
    {
        public string Name { get; set; }

        public string FullName
        {
            get
            {
                var mod = this.Parent as ModuleStatement;
                if (mod != null)
                {
                    return mod.FullName + "." + this.Name;
                }
                else
                {
                    return this.Name;
                }
            }
        }

        public bool Public { get; set; }

        public List<Parameter> Args { get; set; }

        public string ReturnType { get; set; }
    }

#if TypeStrict
    public static class StaticFunctionInterpreter
    {
        #region Function
        public const string FunctionKeyword = "function";

        public static bool IsFunction(this Statement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.LiveStatement)) return false;
            string statementWithoutPublicKeyword = statement.GetStatementIsPublic() ? statement.GetStatementWithoutPublicKeyWord() : statement.LiveStatement;
            return statementWithoutPublicKeyword.StartsWith(FunctionKeyword);
        }



        public static StaticFunctionStatement ToFunction(this OpenBraceStatement statement)
        {
            string signatureWithoutFunctionKeyWord =  statement.GetStatementWithoutPublicKeyWord().Substring(FunctionKeyword.Length + 1).TrimStart();
            string name = signatureWithoutFunctionKeyWord.SubstringBefore(' ', '(');
            string signaturePlus = signatureWithoutFunctionKeyWord.Substring(name.Length).TrimStart();
            string signature = signaturePlus.Substring(1).SubstringBefore(')');
            string returnInfo = statement.GetStatementWithoutPublicKeyWord().SubstringAfter(")").SubstringAfter(":").TrimStart();
            string returnType = null;
            if (string.IsNullOrEmpty(returnInfo))
            {
                returnType = "void";
            }
            else
            {
                returnType = returnInfo.SubstringBefore(' ', '{');
            }
            string[] functionArgs = signature.Split(',');
            var parameterList = new List<Parameter>();
            foreach (string arg in functionArgs)
            {
                if(string.IsNullOrEmpty(arg)) continue;
                string defVal = arg.Contains("=") ? arg.SubstringAfter("=").Trim() : null;
                string type = null;
                string paramName = arg.SubstringBefore(':', '=').Trim();
                if (!arg.Contains(":"))
                {
                    #region insist that default value is specified and simple
                    if (string.IsNullOrEmpty(defVal))
                    {
                        throw new Exception("Error in " + statement.LineNumber + " : no type specified, no default value");
                    }
                    switch (defVal)
                    {
                        case "null":
                            throw new Exception("Error in " + statement.LineNumber + " : no type specified, unable to determine type from default value");
                        case "true":
                        case "false":
                            type = "bool";
                            break;
                    }
                    if (type == null)
                    {
                        if (defVal.StartsWith("\"") && defVal.EndsWith("\""))
                        {
                            type = "string";
                        }
                        else
                        {
                            float f = 0;
                            bool isFloat = float.TryParse(defVal, out f);
                            if (isFloat)
                            {
                                type = "number";
                            }
                            else
                            {
                                throw new Exception("Error in " + statement.LineNumber + " : no type specified, unable to determine type from default value");
                            }
                        }
                    }
                    #endregion
                }
                else
                {
                    type = arg.SubstringAfter(":").TrimStart().SubstringBefore(' ', '=').TrimStart();
                }
                var p = new Parameter
                {
                    Name = paramName,
                    InitialValue = defVal,
                    Type = type
                };
                parameterList.Add(p);
            }
            //string fullName = name;
            //var modParent = statement.Parent as ModuleStatement;
            //if (modParent != null)
            //{
            //    fullName = modParent.FullName + "." + fullName;
            //}
            var functionStatement = new StaticFunctionStatement
            {
                //FullName = fullName,
                Name = name,
                Public = statement.GetStatementIsPublic(),
                Args = parameterList,
                ReturnType = returnType,
            };
            statement.CopyOpenStatementTo(functionStatement);
            return functionStatement;
        }
        #endregion
    }
#endif
}
