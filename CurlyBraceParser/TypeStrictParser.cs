using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
    public class TypeStrictParser
    {
        //Dictionary<char, OpenCloseRule> GroupingPairs;

        public TypeStrictParser()
        {
            //this.GroupingPairs = new Dictionary<char, OpenCloseRule>
            //{
            //    {'{',   OpenCloseRule.Create('{',     '}'           )},
            //    {'[',   OpenCloseRule.Create('[',     ']'           )},
            //    {'(',   OpenCloseRule.Create('(',     ')'           )},
            //};
        }

        public List<Line> Parse(string TypeStrict)
        {
            #region Break Down Text into Lines
            var sr = new StringReader(TypeStrict);
            var lines = new List<string>();
            while (sr.Peek() != -1)
            {
                lines.Add(sr.ReadLine());
            }
            #endregion
            var returnObj = new List<Line>();
            var stack = new Stack<OpenStatement>();
            int lineNo = 1;
            foreach (string line in lines)
            {
                bool insideString = false;
                bool insideComment = false;
                bool insideFinalComment = false;
                Stack<char> openChars = null;
                var chars = line.ToCharArray();
                int len = chars.Length;
                List<char> commentChars = null;
                var liveStatement = new List<char>();
                for (int charNo = 0; charNo < len; charNo++)
                {
                    #region iterate through the chars of the line
                    char c = chars[charNo];
                    if(insideFinalComment)
                    {
                        if(commentChars == null) commentChars = new List<char>();
                        commentChars.Add(c);
                        continue;
                    }
                    else if (insideComment)
                    {
                        #region inside comment
                        if (c == '/')
                        {
                            #region check if comment is ending
                            if (charNo > 0 && chars[charNo - 1] == '*')
                            {
                                insideComment = false;
                                continue;
                            }
                            #endregion
                        }
                        else
                        {
                            if(commentChars == null) commentChars = new List<char>();
                            commentChars.Add(c);
                            continue;
                        }
                        #endregion
                    }
                    else
                    {
                        #region check if comment is beginning
                        if (c == '/' && !insideString)
                        {
                            if (charNo < len - 1 && chars[charNo + 1] == '*')
                            {
                                insideComment = true;
                                charNo++;
                                continue;
                            }
                        }
                        else if (c == '/' && !insideString)
                        {
                            if (charNo < len - 1 && chars[charNo + 1] == '/')
                            {
                                insideFinalComment = true;
                                charNo++;
                                continue;
                            }   
                        }
                        #endregion
                    }
                    liveStatement.Add(c);
                    if (insideString)
                    {
                        #region check if string ended
                        if (c == '"')
                        {
                            if (chars[charNo - 1] != '\\')
                            {
                                insideString = false;
                            }
                        }
                        #endregion
                    }
                    else
                    {
                        if (c == '"')
                        {
                            insideString = true;
                        }
                        else
                        {
                            #region check if opening or closing
                            //bool closedCharFound = false;
                            switch (c)
                            {
                                case '(':
                                case '{':
                                case '[':
                                    //openCharFound = true;
                                    if (openChars == null) openChars = new Stack<char>();
                                    openChars.Push(c);
                                    break;
                                case ')':
                                case '}':
                                case ']':
                                    //closedCharFound = true;
                                    if (openChars == null)
                                    {
                                        if (stack != null)
                                        {
                                            #region closeOpenStatement
                                            var openStatement = stack.Peek();
                                            string expecting = null;
                                            #region get expecting
                                            var test1 = openStatement as OpenParenOpenBraceStatement;
                                            if (test1 != null)
                                            {
                                                expecting = ")}";
                                            }
                                            else
                                            {
                                                var test2 = openStatement as OpenParenOpenBracketStatement;
                                                if (test2 != null)
                                                {
                                                    expecting = ")]";
                                                }
                                                else
                                                {
                                                    var test3 = openStatement as OpenBraceStatment;
                                                    if (test3 != null)
                                                    {
                                                        expecting = "}";
                                                    }
                                                    else
                                                    {
                                                        var test4 = openStatement as OpenBracketStatement;
                                                        if (test4 != null)
                                                        {
                                                            expecting = "]";
                                                        }
                                                        else
                                                        {
                                                            throw new Exception("How did this happen?");
                                                        }
                                                    }
                                                }
                                            }
                                            #endregion
                                            if (expecting == null)
                                            {
                                                throw new Exception("How did this happen?");
                                            }
                                            string actual = c.ToString();
                                            for (int i = 1; i < expecting.Length; i++)
                                            {
                                                charNo++;
                                                if (chars.Length > charNo)
                                                {
                                                    actual += chars[charNo];
                                                    liveStatement.Add(chars[charNo]);
                                                }
                                                else
                                                {
                                                    throw new Exception("Error in Line no: " + lineNo + ". Expecting " + expecting);
                                                }
                                            }
                                            if (actual != expecting)
                                            {
                                                throw new Exception("Error in Line no: " + lineNo + ". Expecting " + expecting);
                                            }
                                            openStatement = stack.Pop();
                                            if (commentChars != null)
                                            {
                                                openStatement.ClosingLineComment = new string( commentChars.ToArray() );
                                                commentChars = null;
                                            }
                                            openStatement.ClosingLine = new string( liveStatement.ToArray());
                                            liveStatement = new List<char>();
                                            if (chars.Length > charNo + 1)
                                            {
                                                var test = chars[charNo + 1];
                                                switch (test)
                                                {
                                                    case ';':
                                                    case ',':
                                                        openStatement.ClosingLine += test;
                                                        charNo++;
                                                        break;
                                                }
                                            }
                                            #endregion
                                        }
                                        else
                                        {
                                            throw new Exception("Error in Line no: " + lineNo + ". Count match " + c);
                                        }
                                    }
                                    else
                                    {
                                        #region verify closing char matches last open char
                                        char lastOpen = openChars.Pop();
                                        switch (c)
                                        {
                                            case ')':
                                                if (lastOpen != '(') throw new Exception("Error in Line no: " + lineNo + ". Count match " + c);
                                                break;
                                            case '}':
                                                if (lastOpen != '{') throw new Exception("Error in Line no: " + lineNo + ". Count match " + c);
                                                break;
                                            case ']':
                                                if (lastOpen != '[') throw new Exception("Error in Line no: " + lineNo + ". Count match " + c);
                                                break;
                                        }
                                        #endregion
                                    }
                                    break;
                            }
                            #endregion
                        }
                    }
                    #endregion

                }
                Line baseLine = null;
                if (openChars == null || openChars.Count == 0)
                {
                    #region Simple Statment
                    if (liveStatement.Count == 0)
                    {
                        baseLine = new Line();
                    }
                    else
                    {
                        baseLine = new Statement();
                    }
                    #endregion
                    if (stack == null)
                    {
                        returnObj.Add(baseLine);
                    }
                    else
                    {
                        if (stack.Count == 0)
                        {
                            returnObj.Add(baseLine);
                        }
                        else
                        {
                            var op = stack.Peek();
                            if (op.Children == null) op.Children = new List<Line>();
                            op.Children.Add(baseLine);
                        }
                    }
                }
                else
                {
                    #region Open Statement
                    if (openChars.Count > 2)
                    {
                        throw new Exception("Error in Line No " + lineNo + ": At most two open chars allowed in one line");
                    }
                    if (openChars.Count == 2)
                    {
                        #region two char open
                        if (openChars.ElementAt(0) == '(')
                        {
                            var lastOpenChar = openChars.ElementAt(1);
                            switch (lastOpenChar)
                            {
                                case '(':
                                    throw new Exception("Error in Line No " + lineNo + ": If two open chars in one line, they can't both be (");
                                case '[':
                                    baseLine = new OpenParenOpenBracketStatement();
                                    break;
                                case '{':
                                    baseLine = new OpenParenOpenBraceStatement();
                                    break;
                            }
                        }
                        else
                        {
                            throw new Exception("Error in Line No " + lineNo + ": If two open chars in one line, the first must be an open (");
                        }
                        #endregion
                    }
                    else
                    {
                        #region one char open
                        char openChar = openChars.ElementAt(0);
                        switch (openChar)
                        {
                            case '(':
                                throw new Exception("Error in Line No " + lineNo + ": Can't end with (");
                            case '[':
                                baseLine = new OpenBracketStatement();
                                break;
                            case '{':
                                baseLine = new OpenBraceStatment();
                                break;
                        }
                        #endregion
                    }
                    #endregion
                    if (stack.Count == 0)
                    {
                        returnObj.Add(baseLine);
                    }
                    else
                    {
                        var op = stack.Peek();
                        if (op.Children == null) op.Children = new List<Line>();
                        op.Children.Add(baseLine);
                    }
                    stack.Push(baseLine as OpenStatement);
                }
                var statement = baseLine as Statement;
                if (statement != null)
                {
                    var charArray = liveStatement.ToArray();
                    string s = new string(charArray);
                    statement.BalancedStatement = s;
                }
                lineNo++;
            }
            return returnObj;
        }


         
    }

    

    public class Line {
        public int LineNumber { get; set; }
        public bool IncludeNextLine { get; set; }
        public OpenStatement Parent { get; set; }
        public string Comment { get; set; }
        public virtual string Content
        {
            get { return Comment; }
        }
    }

    public class Statement : Line
    {
        /// <summary>
        /// Balanced means no dangling brace or other symbol
        /// </summary>
        public string BalancedStatement { get; set; }
        public override string Content
        {
            get
            {
                return this.BalancedStatement + this.Comment;
            }
        }
    }

    public abstract class OpenStatement : Statement
    {
        public List<Line> Children { get; set; }
        public string ClosingLineComment { get; set; }
        public string OptionalLineSeparator { get; set; }
        public string ClosingLine { get; set; }

        public override string Content
        {
            get
            {
                StringWriter sw = new StringWriter();
                sw.WriteLine(base.Content);
                foreach (var child in Children)
                {
                    sw.WriteLine(child.Content);
                }
                sw.WriteLine(this.ClosingLine + this.OptionalLineSeparator + this.ClosingLineComment);
                return sw.ToString();
            }
        }
    }

    public class OpenBraceStatment : OpenStatement{}

    public class OpenParenOpenBraceStatement : OpenStatement{}

    public class OpenBracketStatement : OpenStatement{}

    public class OpenParenOpenBracketStatement : OpenStatement { }

    
}
