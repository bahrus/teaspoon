using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using ClassGenMacros;

namespace CurlyBraceParser
{
#if TypeStrict
    public static class TypeStrictInterpreter
    {

        public const string PublicKeyword = "export";

        #region variable
        public const string VariableKeyword = "var";
        /// <summary>
        /// Only support either typed open statement or primitive or module alias
        /// </summary>
        /// <param name="statement"></param>
        /// <returns></returns>
        public static bool IsVariableDef(this LiveStatement statement)
        {
            if (statement == null || string.IsNullOrEmpty(statement.Statement)) return false;
            return statement.FrontTrimmedLiveStatement.StartsWith(VariableKeyword);
        }

        //public static VariableOpenBraceStatement To
        #endregion

        public static List<ILine> GetOutline(this List<ILine> lines, ProcessedFile pf)
        {
            var returnObj = new List<ILine>();
            foreach (var line in lines)
            {
                GetOutline(line, returnObj, pf);
                
            }
            return returnObj;
        }

        private static void GetOutline(ILine line, List<ILine> OutputLines, ProcessedFile pf)
        {
            
            var statement = line as IOpenBraceStatement;
            if (statement == null)
            {
                if (line.IsReference())
                {
                    var refStatement = new ReferenceStatement(
                        Line: line,
                        ClientSideReference: line.GetReferencePath()
                    );
                    //var refStatement = line.ToReferenceStatement();
                    pf.References[refStatement.ClientSideReference] = refStatement;
                    OutputLines.Add(refStatement);
                }
                else
                {
                    OutputLines.Add(line);
                }
                return;
            }
            bool recurse = true;
            if (statement.IsInterface())
            {
                //var interfaceStatement = statement.ToInterface();
                var interfaceStatement = new Interface(
                    OpenBraceStatementBase: statement,
                    LiveStatementBase: statement.LiveStatementBase,
                    Line: statement.Line,
                    Name: statement.GetInterfaceName()
                );
                pf.Interfaces[interfaceStatement.Name] = interfaceStatement;
                interfaceStatement.Process();
                statement = interfaceStatement as IOpenBraceStatement;
                recurse = false;
            }
            else if (statement.IsFunction())
            {
                //var functionStatement = statement.ToFunction();
                var functionStatement = new StaticFunction(
                    OpenBraceStatementBase: statement, 
                    LiveStatementBase:  statement.LiveStatementBase, 
                    Line: statement.Line,
                    Name:  statement.GetFunctionName()
                );
                string functionName = functionStatement.GetFullName();
                pf.Functions[functionName] = functionStatement; 
            }
            else if (statement.IsClass())
            {
                var classStatement = new Class(
                    OpenBraceStatementBase: statement,
                    LiveStatementBase: statement.LiveStatementBase,
                    Line: statement.Line,
                    Name: statement.GetClassName()
                );
                pf.Classes[classStatement.Name] = classStatement;
                statement = classStatement;
            }
            else if (statement.IsModule())
            {
                //var moduleStatement = statement.ToModule();
                var moduleStatement = new Module(
                    OpenBraceStatementBase: statement,
                    LiveStatementBase: statement.LiveStatementBase,
                    Line: statement.Line,
                    FullName: statement.FrontTrimmedLiveStatement.Trim('{').Trim()
                );
                pf.Modules[moduleStatement.FullName] = moduleStatement;
                statement = moduleStatement;
            }
            
            OutputLines.Add(statement);
            if (statement.Children != null && recurse)
            {
                var newc = new List<ILine>();
                foreach (var childLine in statement.Children)
                {
                    GetOutline(childLine, newc, pf);
                }
                statement.Children = newc;
            }
        }

        public static Parameter ToParameter(this String arg, ILiveStatement statement)
        {
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
            return p;
        }
    }
#endif
}
